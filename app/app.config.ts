// Arah visual ada di DESIGN.md: gaya stiker dan garis tinta 2px diterapkan merata di beranda dan seluruh halaman alat
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'red',
      error: 'red',
      neutral: 'slate'
    },
    button: {
      slots: {
        base: 'rounded-full min-h-11 min-w-11 font-semibold'
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'solid',
          class: 'stiker-tombol'
        },
        {
          color: 'secondary',
          variant: 'solid',
          class: 'stiker-tombol'
        },
        {
          color: 'error',
          variant: 'solid',
          class: 'stiker-tombol'
        },
        {
          color: 'neutral',
          variant: 'solid',
          class: 'stiker-tombol'
        },
        {
          color: 'neutral',
          variant: 'outline',
          class: 'stiker-tombol bg-white text-slate-900 hover:bg-yellow-50 dark:bg-slate-900 dark:text-yellow-100 dark:hover:bg-slate-800'
        },
        {
          color: 'error',
          variant: 'outline',
          class: 'stiker-tombol bg-white text-red-700 hover:bg-red-50 dark:bg-slate-900 dark:text-red-400'
        }
      ]
    },
    card: {
      slots: {
        root: 'rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 ring-0 shadow-none divide-y-2 divide-(--color-tinta)/15',
        header: 'p-4 sm:px-6',
        body: 'p-4 sm:p-6',
        footer: 'p-4 sm:px-6'
      }
    },
    pageCard: {
      slots: {
        root: 'rounded-3xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 ring-0'
      }
    },
    input: {
      slots: {
        base: 'border-2 border-(--color-tinta)/80 bg-white dark:bg-slate-900 ring-0 focus:border-(--color-tinta)'
      }
    },
    textarea: {
      slots: {
        base: 'border-2 border-(--color-tinta)/80 bg-white dark:bg-slate-900 ring-0 focus:border-(--color-tinta)'
      }
    },
    select: {
      slots: {
        base: 'border-2 border-(--color-tinta)/80 bg-white dark:bg-slate-900 ring-0 focus:border-(--color-tinta) min-h-11'
      }
    },
    pageGrid: {
      // Bento: 12 kolom di layar besar, 6 di tablet, 1 di ponsel. Ukuran kartu mengikuti prioritas alat
      base: 'relative grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-[minmax(9rem,auto)]'
    }
  }
})
