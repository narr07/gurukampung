<script setup lang="ts">
const { profile } = useSchoolProfile()

const form = useLocalStorage('gurukampung:modulajar:isi', {
  teacherName: '',
  teacherNip: '',
  subject: ' Ilmu Pengetahuan Alam dan Sosial (IPAS)',
  phaseClass: 'Fase B / Kelas IV (Empat)',
  semester: 'Ganjil',
  timeAllocation: '2 × 35 Menit (1 Pertemuan)',
  topic: 'Bagian Tubuh Tumbuhan dan Fungsinya',
  p5Dimensions: 'Bernalar Kritis, Gotong Royong, Mandiri',
  learningTools: 'Buku siswa, tumbuhan asli di sekitar sekolah, lembar kerja pengamatan',
  learningGoals: '1. Peserta didik mampu mengidentifikasi bagian-bagian tubuh tumbuhan beserta fungsinya.\n2. Peserta didik mampu menyajikan hasil pengamatan bagian tumbuhan di lingkungan sekolah.',
  meaningfulUnderstanding: 'Tumbuhan memiliki bagian tubuh (akar, batang, daun, bunga, buah) yang bekerja sama untuk tumbuh dan menghasilkan oksigen bagi makhluk hidup.',
  triggerQuestions: '1. Mengapa pohon yang tinggi tidak mudah tumbang saat tertiup angin?\n2. Bagaimana cara tumbuhan mendapatkan makanan jika tidak memiliki mulut?',
  openingSteps: '1. Guru membuka kelas dengan salam, doa bersama, dan memeriksa kehadiran siswa.\n2. Guru menyampaikan tujuan pembelajaran dan mengajukan pertanyaan pemantik sambil menunjukkan satu tanaman di pot.',
  coreSteps: '1. Siswa dibagi menjadi kelompok kecil beranggotakan 4 sampai 5 orang.\n2. Setiap kelompok mengamati tanaman di halaman sekolah dan mencatat bentuk akar, batang, serta daun pada Lembar Kerja.\n3. Kelompok mempresentasikan hasil pengamatan di depan kelas dan kelompok lain memberikan tanggapan.',
  closingSteps: '1. Siswa bersama guru menyimpulkan fungsi bagian tubuh tumbuhan.\n2. Siswa mengerjakan 3 soal refleksi singkat.\n3. Guru menutup pelajaran dengan apresiasi dan doa.',
  assessment: '- Asesmen Formatif Awal: Tanya jawab lisan seputar bagian tumbuhan.\n- Asesmen Formatif Proses: Observasi kerja kelompok dan pengisian LKPD.\n- Asesmen Sumatif: Tes tertulis singkat di akhir pertemuan.',
  enrichmentRemedial: '- Pengayaan: Siswa mengamati perbedaan tumbuhan dikotil dan monokotil di kebun sekolah.\n- Remedial: Pendampingan ulang menggunakan kartu gambar bagian tumbuhan.',
  cityDate: 'Majalengka, Oktober 2026'
}, { initOnMounted: true, mergeDefaults: true })
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[24rem_1fr]">
    <div class="space-y-4 max-h-[48rem] overflow-y-auto pr-1 print:hidden">
      <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3 text-xs">
        Nama sekolah dan kepala sekolah otomatis diambil dari menu <strong>Pengaturan</strong>.
      </div>

      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Nama Guru Penyusun">
          <UInput
            v-model="form.teacherName"
            placeholder="Nama lengkap & gelar"
          />
        </UFormField>
        <UFormField label="NIP Guru (opsional)">
          <UInput
            v-model="form.teacherNip"
            placeholder="NIP / NUPTK"
          />
        </UFormField>
      </div>

      <UFormField label="Mata Pelajaran">
        <UInput
          v-model="form.subject"
          class="w-full"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Fase / Kelas">
          <UInput v-model="form.phaseClass" />
        </UFormField>
        <UFormField label="Alokasi Waktu">
          <UInput v-model="form.timeAllocation" />
        </UFormField>
      </div>

      <UFormField label="Topik / Materi Pokok">
        <UInput
          v-model="form.topic"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Dimensi Profil Pelajar Pancasila">
        <UInput
          v-model="form.p5Dimensions"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Sarana, Prasarana &amp; Media">
        <UInput
          v-model="form.learningTools"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Tujuan Pembelajaran (TP)">
        <UTextarea
          v-model="form.learningGoals"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Pemahaman Bermakna">
        <UTextarea
          v-model="form.meaningfulUnderstanding"
          :rows="2"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Pertanyaan Pemantik">
        <UTextarea
          v-model="form.triggerQuestions"
          :rows="2"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Kegiatan Pendahuluan">
        <UTextarea
          v-model="form.openingSteps"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Kegiatan Inti">
        <UTextarea
          v-model="form.coreSteps"
          :rows="4"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Kegiatan Penutup">
        <UTextarea
          v-model="form.closingSteps"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Rencana Asesmen">
        <UTextarea
          v-model="form.assessment"
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Pengayaan &amp; Remedial">
        <UTextarea
          v-model="form.enrichmentRemedial"
          :rows="2"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Tempat &amp; Tanggal Pengesahan">
        <UInput
          v-model="form.cityDate"
          class="w-full"
        />
      </UFormField>
    </div>

    <PrintLayout>
      <div class="p-8 text-sm leading-relaxed text-black space-y-5">
        <PrintHeader
          title="MODUL AJAR KURIKULUM MERDEKA"
          :subtitle="`${form.subject} · ${form.phaseClass}`"
        />

        <!-- A. Informasi Umum -->
        <section>
          <h3 class="border-b-2 border-black pb-1 font-bold uppercase">
            A. Informasi Umum
          </h3>
          <table class="mt-2 w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td class="w-48 border border-black px-2 py-1 font-semibold">
                  Nama Penyusun
                </td>
                <td class="border border-black px-2 py-1">
                  {{ form.teacherName || '................................' }}
                </td>
              </tr>
              <tr>
                <td class="border border-black px-2 py-1 font-semibold">
                  Satuan Pendidikan
                </td>
                <td class="border border-black px-2 py-1">
                  {{ profile.schoolName || '................................' }}
                </td>
              </tr>
              <tr>
                <td class="border border-black px-2 py-1 font-semibold">
                  Mata Pelajaran / Topik
                </td>
                <td class="border border-black px-2 py-1">
                  {{ form.subject }} ({{ form.topic }})
                </td>
              </tr>
              <tr>
                <td class="border border-black px-2 py-1 font-semibold">
                  Fase / Kelas / Alokasi
                </td>
                <td class="border border-black px-2 py-1">
                  {{ form.phaseClass }} · {{ form.timeAllocation }}
                </td>
              </tr>
              <tr>
                <td class="border border-black px-2 py-1 font-semibold">
                  Profil Pelajar Pancasila
                </td>
                <td class="border border-black px-2 py-1">
                  {{ form.p5Dimensions }}
                </td>
              </tr>
              <tr>
                <td class="border border-black px-2 py-1 font-semibold">
                  Sarana &amp; Media
                </td>
                <td class="border border-black px-2 py-1">
                  {{ form.learningTools }}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- B. Komponen Inti -->
        <section class="space-y-3">
          <h3 class="border-b-2 border-black pb-1 font-bold uppercase">
            B. Komponen Inti
          </h3>

          <div>
            <p class="font-bold">
              1. Tujuan Pembelajaran
            </p>
            <p class="whitespace-pre-line ps-4">
              {{ form.learningGoals }}
            </p>
          </div>

          <div>
            <p class="font-bold">
              2. Pemahaman Bermakna
            </p>
            <p class="whitespace-pre-line ps-4">
              {{ form.meaningfulUnderstanding }}
            </p>
          </div>

          <div>
            <p class="font-bold">
              3. Pertanyaan Pemantik
            </p>
            <p class="whitespace-pre-line ps-4">
              {{ form.triggerQuestions }}
            </p>
          </div>

          <div>
            <p class="font-bold">
              4. Langkah-Langkah Kegiatan Pembelajaran
            </p>
            <table class="mt-1 w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td class="w-36 border border-black px-2 py-1.5 font-semibold align-top">
                    Pendahuluan
                  </td>
                  <td class="border border-black px-2 py-1.5 whitespace-pre-line">
                    {{ form.openingSteps }}
                  </td>
                </tr>
                <tr>
                  <td class="border border-black px-2 py-1.5 font-semibold align-top">
                    Kegiatan Inti
                  </td>
                  <td class="border border-black px-2 py-1.5 whitespace-pre-line">
                    {{ form.coreSteps }}
                  </td>
                </tr>
                <tr>
                  <td class="border border-black px-2 py-1.5 font-semibold align-top">
                    Penutup
                  </td>
                  <td class="border border-black px-2 py-1.5 whitespace-pre-line">
                    {{ form.closingSteps }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <p class="font-bold">
              5. Asesmen Pembelajaran
            </p>
            <p class="whitespace-pre-line ps-4">
              {{ form.assessment }}
            </p>
          </div>

          <div>
            <p class="font-bold">
              6. Pengayaan dan Remedial
            </p>
            <p class="whitespace-pre-line ps-4">
              {{ form.enrichmentRemedial }}
            </p>
          </div>
        </section>

        <!-- Pengesahan -->
        <div class="mt-10 grid grid-cols-2 gap-8 pt-4 text-center break-inside-avoid">
          <div>
            <p>Mengetahui,</p>
            <p>Kepala Sekolah</p>
            <p class="mt-16 font-bold underline">
              {{ profile.principalName || '........................................' }}
            </p>
            <p v-if="profile.principalNip">
              NIP {{ profile.principalNip }}
            </p>
          </div>
          <div>
            <p>{{ form.cityDate }}</p>
            <p>Guru Kelas / Mata Pelajaran</p>
            <p class="mt-16 font-bold underline">
              {{ form.teacherName || '........................................' }}
            </p>
            <p v-if="form.teacherNip">
              NIP {{ form.teacherNip }}
            </p>
          </div>
        </div>
      </div>
    </PrintLayout>
  </div>
</template>

