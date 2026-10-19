import {existsSync, readFileSync} from 'fs'
import {resolve} from 'path'
import {rollup} from 'rollup'
import {nodeResolve} from '@rollup/plugin-node-resolve'

/**
 * The suite runs against the sources: babel maps `effector-vue` to `src/vue`,
 * so nothing here loads the published files and terser never runs. These cases
 * read the build when it is there, after `yarn build`, and are skipped when it
 * is not.
 */
const dir = resolve(__dirname, '../../../npm/effector-vue')

const files = [
  'composition.mjs',
  'composition.cjs.js',
  'options-vue3.mjs',
  'options-vue3.cjs.js',
].map(name => resolve(dir, name))

const built = files.every(file => existsSync(file))

;(built ? describe : describe.skip)('the built package', () => {
  /**
   * `booleans_as_integers` of terser turns a boolean literal into a number,
   * and Vue 3.5 reads a numeric `deep` as the depth to traverse, so `1` would
   * watch the top level of the props and nothing under it.
   */
  test.each(files)('keeps the deep watch option a boolean in %s', file => {
    const code = readFileSync(file, 'utf8')

    expect(code.match(/deep:\s*\d+/g) || []).toEqual([])
  })

  /**
   * A namespace import of Vue kept in a variable has to be built in full, so
   * every application would get all of Vue, `TransitionGroup` included. The
   * compat layer reads the namespace member by member, which a bundler
   * resolves to the exports it names.
   */
  test('lets a bundler drop the parts of Vue it does not use', async () => {
    const vue3 = require.resolve('vue-next/dist/vue.runtime.esm-bundler.js')
    const bundle = await rollup({
      input: files[0],
      external: id => /^effector(\/|$)/.test(id),
      plugins: [
        {name: 'vue-3', resolveId: id => (id === 'vue' ? vue3 : null)},
        nodeResolve(),
      ],
      onwarn() {},
    })
    const {output} = await bundle.generate({format: 'es'})

    expect(output[0].code).not.toContain('TransitionGroup')
  })

  /**
   * The root entry serves Vue 2 and also exports EffectorScopePlugin. A named
   * import from 'vue' fails there, Vue 2 lacks most of the Vue 3 API, and the
   * UMD and compat builds bundle a Vue 3 runtime they cannot resolve.
   */
  test('keeps Vue 3 imports out of the root entry', () => {
    const esm = readFileSync(resolve(dir, 'effector-vue.mjs'), 'utf8')

    const named = esm.match(/import\s*\{[^}]*\}\s*from\s*['"]vue['"]/g)

    expect(named || []).toEqual([])
    for (const name of ['effector-vue.umd.js', 'compat.js']) {
      const code = readFileSync(resolve(dir, name), 'utf8')

      expect(code).not.toContain('@vue/runtime-core')
    }
  })
})
