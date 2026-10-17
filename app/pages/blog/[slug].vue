<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`blog-${route.path}`, () =>
  queryCollection('blog').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tulisan tidak ditemukan', fatal: true })
}

const { data: surround } = await useAsyncData(`blog-${route.path}-sekitar`, () =>
  queryCollectionItemSurroundings('blog', route.path, { fields: ['description'] }).order('date', 'DESC')
)

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
  ogType: 'article',
  articlePublishedTime: () => page.value?.date
})

// Gambar pratinjau saat tautan dibagikan ke WhatsApp atau media sosial (dibuat saat build)
defineOgImage('GuruKampung', { title: page.value.title, description: page.value.description })

// Artikel dengan bagian khusus pelanggan ditandai sesuai panduan Google untuk konten berbayar,
// supaya bagian terkunci tidak dianggap menyembunyikan isi dari mesin pencari
if (page.value.terkunci) {
  useSchemaOrg([defineArticle({
    isAccessibleForFree: false,
    hasPart: { '@type': 'WebPageElement', 'isAccessibleForFree': false, 'cssSelector': '.konten-terkunci' }
  })])
}
</script>

<template>
  <BacaanArtikel
    v-if="page"
    :page="page"
    :surround="surround"
    back-to="/blog"
    back-label="Semua tulisan"
  >
    <template #eyebrow>
      <time :datetime="page.date">{{ formatTanggal(page.date) }}</time> · {{ page.penulis }}
    </template>
  </BacaanArtikel>
</template>
