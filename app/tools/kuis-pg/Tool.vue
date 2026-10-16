<script setup lang="ts">
import { mulberry32 } from '~/utils/random'
import { buildQuizPackage, type QuizQuestion } from '~/utils/quiz'

const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    stem: 'Lambang sila ketiga Pancasila adalah ...',
    options: ['Pohon beringin', 'Bintang', 'Rantai emas', 'Padi dan kapas'],
    correctIndex: 0
  },
  {
    id: 'q2',
    stem: 'Hasil dari 24 × 5 adalah ...',
    options: ['120', '110', '105', '125'],
    correctIndex: 0
  },
  {
    id: 'q3',
    stem: 'Perubahan wujud benda dari cair menjadi gas disebut ...',
    options: ['Menguap', 'Mencair', 'Membeku', 'Menyublim'],
    correctIndex: 0
  }
]

const title = useLocalStorage('peragu:kuis:judul', 'Latihan Sumatif', { initOnMounted: true })
const questions = useLocalStorage<QuizQuestion[]>(
  'peragu:kuis:soal',
  DEFAULT_QUESTIONS.map(q => ({ ...q, options: [...q.options] as [string, string, string, string] })),
  { initOnMounted: true }
)
const shuffleQuestions = useLocalStorage('peragu:kuis:acak-soal', true, { initOnMounted: true })
const shuffleOptions = useLocalStorage('peragu:kuis:acak-opsi', true, { initOnMounted: true })
const includePackageB = useLocalStorage('peragu:kuis:paket-b', true, { initOnMounted: true })
const { seed, reroll } = useSeed()

const packageA = computed(() => buildQuizPackage(mulberry32(seed.value), questions.value, shuffleQuestions.value, shuffleOptions.value))
const packageB = computed(() => buildQuizPackage(mulberry32(seed.value + 7919), questions.value, shuffleQuestions.value, shuffleOptions.value))

function addQuestion() {
  questions.value.push({
    id: `q-${Date.now().toString(36)}`,
    stem: `Pertanyaan nomor ${questions.value.length + 1}`,
    options: ['Jawaban benar', 'Pengecoh 1', 'Pengecoh 2', 'Pengecoh 3'],
    correctIndex: 0
  })
}

function removeQuestion(id: string) {
  if (questions.value.length <= 1) return
  questions.value = questions.value.filter(q => q.id !== id)
}

const correctItems = [
  { value: 0, label: 'Pilihan 1 adalah kunci benar' },
  { value: 1, label: 'Pilihan 2 adalah kunci benar' },
  { value: 2, label: 'Pilihan 3 adalah kunci benar' },
  { value: 3, label: 'Pilihan 4 adalah kunci benar' }
]
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-[24rem_1fr]">
      <div class="space-y-4 print:hidden">
        <UFormField label="Judul kuis">
          <UInput
            v-model="title"
            class="w-full"
          />
        </UFormField>

        <USwitch
          v-model="shuffleQuestions"
          label="Acak urutan nomor soal"
        />
        <USwitch
          v-model="shuffleOptions"
          label="Acak urutan pilihan A, B, C, D"
        />
        <USwitch
          v-model="includePackageB"
          label="Sertakan Paket B dan kunci jawaban"
        />

        <UButton
          block
          icon="i-lucide-shuffle"
          @click="reroll"
        >
          Acak ulang urutan Paket A &amp; B
        </UButton>

        <div class="space-y-3 max-h-[34rem] overflow-y-auto pr-1">
          <UCard
            v-for="(q, idx) in questions"
            :key="q.id"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-bold text-highlighted">Soal {{ idx + 1 }}</span>
                <UButton
                  icon="i-lucide-trash-2"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :disabled="questions.length <= 1"
                  :aria-label="`Hapus soal ${idx + 1}`"
                  @click="removeQuestion(q.id)"
                />
              </div>

              <UTextarea
                v-model="q.stem"
                :rows="2"
                :aria-label="`Pokok soal ${idx + 1}`"
                class="w-full"
              />

              <div class="grid grid-cols-2 gap-2">
                <UInput
                  v-for="optIdx in 4"
                  :key="optIdx"
                  v-model="q.options[optIdx - 1]"
                  :placeholder="`Pilihan ${optIdx}`"
                  :aria-label="`Pilihan ${optIdx} soal ${idx + 1}`"
                />
              </div>

              <USelect
                v-model="q.correctIndex"
                :items="correctItems"
                :aria-label="`Kunci benar soal ${idx + 1}`"
                class="w-full"
              />
            </div>
          </UCard>
        </div>

        <UButton
          block
          color="neutral"
          variant="outline"
          icon="i-lucide-plus"
          @click="addQuestion"
        >
          Tambah soal baru
        </UButton>
      </div>

      <PrintLayout>
        <div class="p-6">
          <!-- Paket A -->
          <div>
            <PrintHeader
              :title="`${title} (Paket A)`"
              :subtitle="`Kode kuis ${seed}`"
            />
            <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
              <span>Nama: ____________________</span>
              <span>Kelas: ________</span>
              <span>Paket: A</span>
            </div>

            <ol class="space-y-4 text-sm">
              <li
                v-for="q in packageA"
                :key="`a-${q.number}`"
                class="break-inside-avoid"
              >
                <p class="font-medium">
                  {{ q.number }}. {{ q.stem }}
                </p>
                <div class="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 ps-4">
                  <span
                    v-for="opt in q.options"
                    :key="opt.letter"
                  >{{ opt.letter }}. {{ opt.text }}</span>
                </div>
              </li>
            </ol>
          </div>

          <!-- Paket B -->
          <div
            v-if="includePackageB"
            class="mt-10 border-t-2 border-dashed border-gray-400 pt-6 print:mt-0 print:border-0 print:pt-0 print:break-before-page"
          >
            <PrintHeader
              :title="`${title} (Paket B)`"
              :subtitle="`Kode kuis ${seed}`"
            />
            <div class="mb-4 grid grid-cols-3 gap-4 text-sm">
              <span>Nama: ____________________</span>
              <span>Kelas: ________</span>
              <span>Paket: B</span>
            </div>

            <ol class="space-y-4 text-sm">
              <li
                v-for="q in packageB"
                :key="`b-${q.number}`"
                class="break-inside-avoid"
              >
                <p class="font-medium">
                  {{ q.number }}. {{ q.stem }}
                </p>
                <div class="mt-1 grid grid-cols-2 gap-x-6 gap-y-1 ps-4">
                  <span
                    v-for="opt in q.options"
                    :key="opt.letter"
                  >{{ opt.letter }}. {{ opt.text }}</span>
                </div>
              </li>
            </ol>
          </div>

          <!-- Kunci Jawaban Paket A & B -->
          <div
            class="mt-10 border-t-2 border-dashed border-gray-400 pt-6 print:mt-0 print:border-0 print:pt-0 print:break-before-page"
          >
            <PrintHeader
              :title="`Kunci Jawaban: ${title}`"
              :subtitle="`Kode kuis ${seed}`"
            />
            <div class="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p class="font-bold mb-2 border-b border-black pb-1">
                  Kunci Paket A
                </p>
                <ol class="space-y-1">
                  <li
                    v-for="q in packageA"
                    :key="`ka-${q.number}`"
                  >
                    {{ q.number }}. <strong>{{ q.answerLetter }}</strong>
                  </li>
                </ol>
              </div>
              <div v-if="includePackageB">
                <p class="font-bold mb-2 border-b border-black pb-1">
                  Kunci Paket B
                </p>
                <ol class="space-y-1">
                  <li
                    v-for="q in packageB"
                    :key="`kb-${q.number}`"
                  >
                    {{ q.number }}. <strong>{{ q.answerLetter }}</strong>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </PrintLayout>
    </div>
  </div>
</template>

