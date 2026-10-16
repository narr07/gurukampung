<script setup lang="ts">
import { makePiketSchedule } from '~/utils/fase3'

const { classId, activeClass, students } = useActiveClass()
const { profile } = useSchoolProfile()

const daysCount = useLocalStorage<5 | 6>('peragu:piket:hari', 5, { initOnMounted: true })
const weekNumber = useLocalStorage('peragu:piket:minggu', 1, { initOnMounted: true })
const tasksNote = useLocalStorage(
  'peragu:piket:tugas',
  '1. Menyapu lantai dan merapikan meja kursi sebelum bel masuk.\n2. Menghapus papan tulis setiap pergantian jam pelajaran.\n3. Membuang sampah pada tempatnya sebelum pulang sekolah.',
  { initOnMounted: true }
)

const schedule = computed(() =>
  makePiketSchedule(
    students.value.map(s => s.name),
    daysCount.value,
    weekNumber.value
  )
)

const dayItems = [
  { value: 5, label: '5 hari sekolah (Senin sampai Jumat)' },
  { value: 6, label: '6 hari sekolah (Senin sampai Sabtu)' }
]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
    <div class="space-y-4 print:hidden">
      <ClassPicker v-model="classId" />

      <UFormField label="Hari aktif sekolah">
        <USelect
          v-model="daysCount"
          :items="dayItems"
          class="w-full"
        />
      </UFormField>

      <UFormField
        label="Minggu ke- (rotasi otomatis)"
        hint="Naikkan angka minggu untuk menggeser giliran hari piket"
      >
        <div class="flex items-center gap-2">
          <UInputNumber
            v-model="weekNumber"
            :min="1"
            :max="52"
            class="w-32"
          />
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-refresh-cw"
            @click="weekNumber = (weekNumber % daysCount) + 1"
          >
            Putar minggu
          </UButton>
        </div>
      </UFormField>

      <UFormField label="Catatan tugas piket di bawah jadwal">
        <UTextarea
          v-model="tasksNote"
          :rows="5"
          class="w-full"
        />
      </UFormField>
    </div>

    <div>
      <UEmpty
        v-if="students.length === 0"
        icon="i-lucide-calendar-days"
        title="Belum ada siswa"
        description="Pilih kelas yang sudah berisi siswa di Data Kelas."
      />

      <template v-else>
        <div class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 print:hidden">
          <div
            v-for="group in schedule"
            :key="group.day"
            class="rounded-2xl border-2 border-(--color-tinta) bg-white dark:bg-slate-900 p-4 shadow-[0_3px_0_0_var(--color-tinta)]"
          >
            <div class="flex items-center justify-between">
              <span class="lencana-pensil px-3 py-0.5 font-display text-sm font-extrabold">
                {{ group.day }}
              </span>
              <span class="text-xs font-bold text-muted">{{ group.members.length }} siswa</span>
            </div>
            <ol class="mt-3 list-decimal space-y-1 ps-5 text-sm font-medium">
              <li
                v-for="name in group.members"
                :key="name"
              >
                {{ name }}
              </li>
            </ol>
          </div>
        </div>

        <h2 class="mb-2 font-display font-bold text-highlighted print:hidden">
          Cetak jadwal piket 1 halaman
        </h2>
        <PrintLayout>
          <div class="p-6">
            <PrintHeader
              :title="`JADWAL PIKET KELAS ${activeClass?.name?.toUpperCase() ?? ''}`"
              :subtitle="`${profile.schoolName || 'Tahun Ajaran Aktif'} · Rotasi Minggu ke-${weekNumber}`"
            />

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div
                v-for="group in schedule"
                :key="`p-${group.day}`"
                class="break-inside-avoid border-2 border-black p-3"
              >
                <p class="border-b-2 border-black pb-1 text-center font-bold uppercase tracking-wide">
                  {{ group.day }}
                </p>
                <ol class="mt-2 list-decimal space-y-1 ps-5 text-sm">
                  <li
                    v-for="name in group.members"
                    :key="`pm-${name}`"
                  >
                    {{ name }}
                  </li>
                </ol>
              </div>
            </div>

            <div
              v-if="tasksNote.trim()"
              class="mt-6 border-2 border-black p-3 text-xs"
            >
              <p class="font-bold uppercase">
                Ketentuan &amp; Tugas Regu Piket:
              </p>
              <p class="mt-1 whitespace-pre-line">
                {{ tasksNote }}
              </p>
            </div>
          </div>
        </PrintLayout>
      </template>
    </div>
  </div>
</template>

