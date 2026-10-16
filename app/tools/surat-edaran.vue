<script setup lang="ts">
const toast = useToast()
const { profile } = useSchoolProfile()

const TEMPLATES = {
  rapat: {
    subject: 'Undangan Pertemuan Orang Tua / Wali Siswa',
    opening: 'Dengan hormat, kami mengundang Bapak/Ibu Orang Tua/Wali siswa untuk hadir dalam pertemuan pembahasan kegiatan kelas dan perkembangan belajar siswa yang akan dilaksanakan pada:',
    dayDate: 'Sabtu, 24 Oktober 2026',
    time: '08.30 - 10.30 WIB',
    place: 'Ruang Kelas',
    closing: 'Mengingat pentingnya acara tersebut, kehadiran Bapak/Ibu tepat pada waktunya sangat kami harapkan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.'
  },
  kegiatan: {
    subject: 'Pemberitahuan Kegiatan Belajar di Luar Kelas',
    opening: 'Dengan hormat, kami memberitahukan bahwa sekolah akan mengadakan kegiatan kunjungan edukasi dan pembelajaran luar kelas pada:',
    dayDate: 'Kamis, 29 Oktober 2026',
    time: '07.30 - 13.00 WIB',
    place: 'Halaman Sekolah (Titik Kumpul)',
    closing: 'Mohon Bapak/Ibu memastikan putra/putrinya membawa bekal makan siang, air minum, dan mengenakan seragam olahraga. Terima kasih atas dukungan Bapak/Ibu.'
  },
  ujian: {
    subject: 'Pemberitahuan Pelaksanaan Asesmen Sumatif Akhir Semester',
    opening: 'Dengan hormat, kami menginformasikan bahwa pelaksanaan Asesmen Sumatif Akhir Semester akan berlangsung mulai:',
    dayDate: 'Senin, 30 November s.d. Jumat, 4 Desember 2026',
    time: '07.30 - 11.00 WIB',
    place: 'Ruang Kelas Masing-Masing',
    closing: 'Kami mohon kerja sama Bapak/Ibu untuk mendampingi putra/putrinya belajar di rumah serta menjaga kesehatan selama pekan asesmen berlangsung.'
  }
}

const preset = ref<'rapat' | 'kegiatan' | 'ujian'>('rapat')
const form = useLocalStorage('gurukampung:surat:isi', {
  number: '005 / SD / X / 2026',
  attachment: '-',
  subject: TEMPLATES.rapat.subject,
  recipient: 'Orang Tua / Wali Siswa',
  opening: TEMPLATES.rapat.opening,
  dayDate: TEMPLATES.rapat.dayDate,
  time: TEMPLATES.rapat.time,
  place: TEMPLATES.rapat.place,
  closing: TEMPLATES.rapat.closing,
  cityDate: 'Majalengka, 20 Oktober 2026'
}, { initOnMounted: true, mergeDefaults: true })

function applyTemplate(key: 'rapat' | 'kegiatan' | 'ujian') {
  preset.value = key
  const t = TEMPLATES[key]
  form.value.subject = t.subject
  form.value.opening = t.opening
  form.value.dayDate = t.dayDate
  form.value.time = t.time
  form.value.place = t.place
  form.value.closing = t.closing
}

async function copyForWhatsApp() {
  const school = profile.value.schoolName || 'Sekolah'
  const text = [
    `*${form.value.subject.toUpperCase()}*`,
    `*${school}*`,
    `Nomor: ${form.value.number}`,
    '',
    `Yth. Bapak/Ibu ${form.value.recipient}`,
    '',
    form.value.opening,
    `- *Hari/Tanggal:* ${form.value.dayDate}`,
    `- *Waktu:* ${form.value.time}`,
    `- *Tempat:* ${form.value.place}`,
    '',
    form.value.closing,
    '',
    `${form.value.cityDate}`,
    `Kepala Sekolah: ${profile.value.principalName || '-'}`
  ].join('\n')

  await navigator.clipboard.writeText(text)
  toast.add({
    title: 'Teks WhatsApp berhasil disalin',
    description: 'Siap ditempel langsung ke grup WhatsApp paguyuban kelas.',
    color: 'success',
    icon: 'i-lucide-message-circle'
  })
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[22rem_1fr]">
    <div class="space-y-4 print:hidden">
      <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3.5 space-y-2">
        <p class="text-xs font-bold uppercase tracking-wider text-muted">
          Pilih contoh template cepat:
        </p>
        <div class="flex flex-wrap gap-1.5">
          <UButton
            size="xs"
            :color="preset === 'rapat' ? 'primary' : 'neutral'"
            :variant="preset === 'rapat' ? 'solid' : 'outline'"
            @click="applyTemplate('rapat')"
          >
            Rapat Orang Tua
          </UButton>
          <UButton
            size="xs"
            :color="preset === 'kegiatan' ? 'primary' : 'neutral'"
            :variant="preset === 'kegiatan' ? 'solid' : 'outline'"
            @click="applyTemplate('kegiatan')"
          >
            Kegiatan Luar Kelas
          </UButton>
          <UButton
            size="xs"
            :color="preset === 'ujian' ? 'primary' : 'neutral'"
            :variant="preset === 'ujian' ? 'solid' : 'outline'"
            @click="applyTemplate('ujian')"
          >
            Jadwal Ujian
          </UButton>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Nomor surat">
          <UInput v-model="form.number" />
        </UFormField>
        <UFormField label="Lampiran">
          <UInput v-model="form.attachment" />
        </UFormField>
      </div>

      <UFormField label="Perihal">
        <UInput
          v-model="form.subject"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Tujuan surat">
        <UInput
          v-model="form.recipient"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Paragraf pembuka">
        <UTextarea
          v-model="form.opening"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Hari &amp; tanggal acara">
        <UInput
          v-model="form.dayDate"
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Waktu">
          <UInput v-model="form.time" />
        </UFormField>
        <UFormField label="Tempat">
          <UInput v-model="form.place" />
        </UFormField>
      </div>

      <UFormField label="Paragraf penutup">
        <UTextarea
          v-model="form.closing"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Tempat &amp; tanggal surat">
        <UInput
          v-model="form.cityDate"
          class="w-full"
        />
      </UFormField>

      <UButton
        block
        color="secondary"
        icon="i-lucide-copy"
        @click="copyForWhatsApp"
      >
        Salin format pesan WhatsApp
      </UButton>
    </div>

    <PrintLayout>
      <div class="p-8 text-sm leading-relaxed text-black">
        <PrintHeader
          :title="form.subject"
          subtitle="Surat Edaran Resmi Sekolah"
        />

        <table class="mb-6 text-sm">
          <tbody>
            <tr>
              <td class="w-24">
                Nomor
              </td>
              <td class="px-2">
                :
              </td>
              <td>{{ form.number }}</td>
            </tr>
            <tr>
              <td>Lampiran</td>
              <td class="px-2">
                :
              </td>
              <td>{{ form.attachment }}</td>
            </tr>
            <tr>
              <td>Perihal</td>
              <td class="px-2">
                :
              </td>
              <td class="font-bold">
                {{ form.subject }}
              </td>
            </tr>
          </tbody>
        </table>

        <p class="mb-4">
          Kepada Yth.<br>
          <strong>Bapak/Ibu {{ form.recipient }}</strong><br>
          di Tempat
        </p>

        <p class="mb-4 text-justify">
          {{ form.opening }}
        </p>

        <table class="my-4 ms-6 text-sm">
          <tbody>
            <tr>
              <td class="w-32 py-0.5">
                Hari, Tanggal
              </td>
              <td class="px-2">
                :
              </td>
              <td class="font-semibold">
                {{ form.dayDate }}
              </td>
            </tr>
            <tr>
              <td class="py-0.5">
                Waktu
              </td>
              <td class="px-2">
                :
              </td>
              <td class="font-semibold">
                {{ form.time }}
              </td>
            </tr>
            <tr>
              <td class="py-0.5">
                Tempat
              </td>
              <td class="px-2">
                :
              </td>
              <td class="font-semibold">
                {{ form.place }}
              </td>
            </tr>
          </tbody>
        </table>

        <p class="mt-4 text-justify">
          {{ form.closing }}
        </p>

        <div class="mt-12 flex justify-end">
          <div class="w-64 text-center">
            <p>{{ form.cityDate }}</p>
            <p>Kepala Sekolah,</p>
            <p class="mt-16 font-bold underline">
              {{ profile.principalName || '........................................' }}
            </p>
            <p v-if="profile.principalNip">
              NIP {{ profile.principalNip }}
            </p>
          </div>
        </div>
      </div>
    </PrintLayout>
  </div>
</template>

