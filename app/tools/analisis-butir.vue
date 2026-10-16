<script setup lang="ts">
import { analyzeMultipleChoice, type StudentAnswerRow } from '~/utils/fase4'

const title = useLocalStorage('peragu:analisis:judul', 'Analisis Butir Soal Sumatif', { initOnMounted: true })
const kktp = useLocalStorage('peragu:analisis:kktp', 75, { initOnMounted: true })
const keyInput = useLocalStorage('peragu:analisis:kunci', 'A, B, C, D, A, B, C, D, A, B', { initOnMounted: true })
const rawResponses = useLocalStorage(
  'peragu:analisis:jawaban',
  'Ahmad\tA, B, C, D, A, B, C, D, A, B\nBudi\tA, B, C, D, A, B, C, A, A, B\nCitra\tA, B, C, D, A, B, A, A, B, B\nDedi\tA, B, C, A, B, B, C, D, A, C\nEka\tA, A, C, D, A, C, C, D, B, B\nFajar\tB, B, A, A, C, C, D, A, B, C',
  { initOnMounted: true }
)

const keys = computed(() =>
  keyInput.value
    .split(/[\s,;]+/)
    .map(k => k.trim().toUpperCase())
    .filter(Boolean)
)

const rows = computed<StudentAnswerRow[]>(() => {
  return rawResponses.value
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const parts = line.includes('\t') ? line.split('\t') : line.split(':')
      if (parts.length >= 2) {
        const studentName = parts[0]!.trim() || `Siswa ${idx + 1}`
        const answers = parts.slice(1).join(' ').split(/[\s,;]+/).map(a => a.trim().toUpperCase()).filter(Boolean)
        return { studentName, answers }
      }
      const tokens = line.split(/[\s,;]+/).map(a => a.trim().toUpperCase()).filter(Boolean)
      return { studentName: `Siswa ${idx + 1}`, answers: tokens }
    })
})

const analysis = computed(() => analyzeMultipleChoice(keys.value, rows.value, kktp.value))
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-[23rem_1fr]">
      <div class="space-y-4 print:hidden">
        <UFormField label="Judul ujian / mata pelajaran">
          <UInput
            v-model="title"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Batas tuntas (KKTP)">
          <UInputNumber
            v-model="kktp"
            :min="0"
            :max="100"
            class="w-32"
          />
        </UFormField>

        <UFormField
          :label="`Kunci jawaban (${keys.length} soal)`"
          hint="Pisahkan dengan koma atau spasi, contoh: A, B, C, D"
        >
          <UInput
            v-model="keyInput"
            class="w-full font-mono uppercase"
          />
        </UFormField>

        <UFormField
          :label="`Jawaban siswa (${rows.length} siswa)`"
          hint="Format per baris: Nama [Tab atau :] A, B, C, D..."
        >
          <UTextarea
            v-model="rawResponses"
            :rows="10"
            class="w-full font-mono text-xs"
          />
        </UFormField>

        <div class="rounded-2xl border-2 border-(--color-tinta) bg-amber-50/70 dark:bg-slate-800/80 p-3.5 text-xs space-y-1.5">
          <p class="font-display font-bold text-highlighted">
            Rumus yang digunakan:
          </p>
          <p>
            <strong>Tingkat Kesukaran (P)</strong> = Jumlah siswa menjawab benar dibagi jumlah seluruh siswa ($P = B / N$). Sukar &lt; 0,30; Sedang 0,30 sampai 0,70; Mudah &gt; 0,70.
          </p>
          <p>
            <strong>Daya Beda (D)</strong> = Proporsi benar kelompok atas dikurangi kelompok bawah ($D = P_A - P_B$). Baik Sekali ≥ 0,40; Baik 0,30 sampai 0,39; Cukup 0,20 sampai 0,29; Perlu Revisi &lt; 0,20.
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-3 print:hidden">
          <div class="rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-4 shadow-[0_3px_0_0_var(--color-tinta)]">
            <p class="text-xs font-bold uppercase text-muted">
              Rata-Rata Kelas
            </p>
            <p class="mt-1 font-display text-3xl font-extrabold tabular-nums text-highlighted">
              {{ analysis.averageScore }}
            </p>
          </div>
          <div class="rounded-2xl border-2 border-(--color-tinta) bg-(--color-pensil) p-4 text-slate-950 shadow-[0_3px_0_0_var(--color-tinta)]">
            <p class="text-xs font-bold uppercase">
              Ketuntasan Klasikal
            </p>
            <p class="mt-1 font-display text-3xl font-extrabold tabular-nums">
              {{ analysis.classicalMasteryPercent }}%
            </p>
          </div>
          <div class="rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-4 shadow-[0_3px_0_0_var(--color-tinta)]">
            <p class="text-xs font-bold uppercase text-muted">
              Jumlah Peserta &amp; Soal
            </p>
            <p class="mt-1 font-display text-2xl font-extrabold tabular-nums text-highlighted">
              {{ rows.length }} siswa · {{ keys.length }} soal
            </p>
          </div>
        </div>

        <PrintLayout>
          <div class="p-6 space-y-6">
            <PrintHeader
              :title="title"
              :subtitle="`Rata-rata: ${analysis.averageScore} · Ketuntasan Klasikal: ${analysis.classicalMasteryPercent}% (KKTP ${kktp})`"
            />

            <div>
              <h3 class="mb-2 font-bold text-sm uppercase">
                A. Tabel Analisis Butir Soal Pilihan Ganda
              </h3>
              <table class="w-full border-collapse text-xs tabular-nums">
                <thead>
                  <tr>
                    <th class="border border-black px-2 py-1">
                      No
                    </th>
                    <th class="border border-black px-2 py-1">
                      Kunci
                    </th>
                    <th class="border border-black px-2 py-1">
                      Benar
                    </th>
                    <th class="border border-black px-2 py-1">
                      Indeks P
                    </th>
                    <th class="border border-black px-2 py-1">
                      Tafsiran Kesukaran
                    </th>
                    <th class="border border-black px-2 py-1">
                      Indeks D
                    </th>
                    <th class="border border-black px-2 py-1">
                      Tafsiran Daya Beda
                    </th>
                    <th class="border border-black px-2 py-1">
                      Sebaran A/B/C/D
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in analysis.itemStats"
                    :key="item.number"
                  >
                    <td class="border border-black px-2 py-1 text-center font-bold">
                      {{ item.number }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center font-bold">
                      {{ item.key }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center">
                      {{ item.correctCount }}/{{ rows.length }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center">
                      {{ item.difficultyIndex.toFixed(2) }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center">
                      {{ item.difficultyLabel }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center">
                      {{ item.discriminationIndex.toFixed(2) }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center font-semibold">
                      {{ item.discriminationLabel }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center">
                      A:{{ item.optionCounts.A }} B:{{ item.optionCounts.B }} C:{{ item.optionCounts.C }} D:{{ item.optionCounts.D }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h3 class="mb-2 font-bold text-sm uppercase">
                B. Rekap Skor Siswa
              </h3>
              <table class="w-full border-collapse text-xs tabular-nums">
                <thead>
                  <tr>
                    <th class="border border-black px-2 py-1 w-10">
                      No
                    </th>
                    <th class="border border-black px-2 py-1 text-left">
                      Nama Siswa
                    </th>
                    <th class="border border-black px-2 py-1 w-24">
                      Jawaban Benar
                    </th>
                    <th class="border border-black px-2 py-1 w-20">
                      Nilai
                    </th>
                    <th class="border border-black px-2 py-1 w-28">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(st, idx) in analysis.studentScores"
                    :key="idx"
                  >
                    <td class="border border-black px-2 py-1 text-center">
                      {{ idx + 1 }}
                    </td>
                    <td class="border border-black px-2 py-1">
                      {{ st.name }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center">
                      {{ st.correct }} / {{ keys.length }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center font-bold">
                      {{ st.score }}
                    </td>
                    <td class="border border-black px-2 py-1 text-center">
                      {{ st.tuntas ? 'Tuntas' : 'Perlu Remedial' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PrintLayout>
      </div>
    </div>
  </div>
</template>

