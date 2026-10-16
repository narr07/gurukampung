<script setup lang="ts">
import { parseRoster, type Gender, type Student } from '~/utils/roster'
import { SAMPLE_CLASS_NAME, sampleStudents } from '~/utils/sample'

useSeoMeta({ title: 'Data Kelas' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { classes, status, createClass, renameClass, saveStudents, deleteClass, newStudentId } = useClasses()

// Kelas yang sedang dibuka disimpan di URL (?id=) supaya halaman tetap statis (tanpa route dinamis per kelas)
const selectedId = computed({
  get: () => (typeof route.query.id === 'string' ? route.query.id : undefined),
  set: id => router.replace({ query: id ? { id } : {} })
})
const selected = computed(() => classes.value.find(c => c.id === selectedId.value))

// ---------- Buat kelas
const newClassName = ref('')
async function addClass() {
  const name = newClassName.value.trim()
  if (!name) return
  const record = await createClass(name)
  newClassName.value = ''
  selectedId.value = record.id
}

// Kelas berisi siswa dummy untuk mencoba alat
const hasSample = computed(() => classes.value.some(c => c.name === SAMPLE_CLASS_NAME))
async function addSampleClass() {
  const record = await createClass(SAMPLE_CLASS_NAME)
  await saveStudents(record.id, sampleStudents(newStudentId))
  toast.add({ title: 'Kelas contoh dibuat', description: '24 siswa dummy, boleh dihapus kapan saja.', color: 'success', icon: 'i-lucide-check' })
}

// ---------- Ubah daftar siswa (salinan lokal, disimpan saat tombol Simpan ditekan)
const draftName = ref('')
const draftStudents = ref<Student[]>([])
const isDirty = ref(false)

watch(selected, (c) => {
  if (!c || isDirty.value) return
  draftName.value = c.name
  draftStudents.value = c.students.map(s => ({ ...s }))
}, { immediate: true })

watch(selectedId, () => {
  isDirty.value = false
  const c = selected.value
  draftName.value = c?.name ?? ''
  draftStudents.value = c?.students.map(s => ({ ...s })) ?? []
})

const markDirty = () => {
  isDirty.value = true
}

function addEmptyStudent() {
  draftStudents.value.push({ id: newStudentId(), name: '', number: draftStudents.value.length + 1 })
  markDirty()
}

function removeStudent(id: string) {
  draftStudents.value = draftStudents.value.filter(s => s.id !== id)
  markDirty()
}

const isSaving = ref(false)
async function save() {
  if (!selected.value) return
  isSaving.value = true
  try {
    const students = draftStudents.value.filter(s => s.name.trim())
    if (draftName.value.trim() && draftName.value !== selected.value.name) await renameClass(selected.value.id, draftName.value)
    await saveStudents(selected.value.id, students)
    isDirty.value = false
    toast.add({ title: 'Kelas tersimpan', description: `${students.length} siswa`, color: 'success', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Gagal menyimpan', description: 'Penyimpanan peramban mungkin diblokir atau penuh.', color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    isSaving.value = false
  }
}

function discard() {
  isDirty.value = false
  draftName.value = selected.value?.name ?? ''
  draftStudents.value = selected.value?.students.map(s => ({ ...s })) ?? []
}

// ---------- Tempel dari Excel
const pasteText = ref('')
const parsed = computed(() => parseRoster(pasteText.value))
function addParsed() {
  const start = draftStudents.value.length
  draftStudents.value.push(...parsed.value.students.map((s, i) => ({ id: newStudentId(), ...s, number: s.number ?? start + i + 1 })))
  toast.add({ title: `${parsed.value.students.length} siswa ditambahkan`, description: 'Tekan Simpan supaya tersimpan.', color: 'info', icon: 'i-lucide-clipboard-paste' })
  pasteText.value = ''
  markDirty()
}

// ---------- Hapus kelas
const deleteOpen = ref(false)
async function confirmDelete() {
  if (!selected.value) return
  const name = selected.value.name
  await deleteClass(selected.value.id)
  deleteOpen.value = false
  isDirty.value = false
  selectedId.value = undefined
  toast.add({ title: `Kelas ${name} dihapus`, color: 'neutral', icon: 'i-lucide-trash-2' })
}

const genderItems: { value: Gender, label: string }[] = [
  { value: 'L', label: 'L' },
  { value: 'P', label: 'P' }
]

onBeforeRouteLeave(() => {
  if (isDirty.value) return window.confirm('Perubahan daftar siswa belum disimpan. Tinggalkan halaman ini?')
})
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      title="Data Kelas"
      description="Isi daftar siswa sekali, lalu pakai di semua alat. Daftar bisa ditempel langsung dari Excel atau Google Sheets."
      badge="Fondasi Kelas"
      icon="i-lucide-users"
      illustration="kartu-nama"
    />

    <USkeleton
      v-if="status === 'pending'"
      class="h-40 w-full"
    />
    <UAlert
      v-else-if="status === 'error'"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Data kelas tidak bisa dibaca dari perangkat ini."
      description="Peramban mungkin dalam mode penyamaran atau penyimpanannya diblokir. Coba buka di jendela biasa."
    />

    <UPageGrid v-else>
      <!-- Kartu terbesar: kelas yang sedang diubah. Tanpa kelas terpilih, kartu ini berisi daftar kelas -->
      <UCard class="sm:col-span-6 lg:col-span-8 lg:row-span-2">
        <template v-if="!selected">
          <UEmpty
            v-if="classes.length === 0"
            icon="i-lucide-users"
            title="Belum ada kelas"
            description="Buat kelas pertama di kartu sebelah, misalnya &quot;Kelas 4A&quot;. Atau coba dulu dengan kelas contoh berisi siswa dummy."
            :actions="[{ label: 'Isi kelas contoh', icon: 'i-lucide-flask-conical', color: 'neutral', variant: 'outline', onClick: addSampleClass }]"
          />
          <div v-else>
            <h2 class="font-semibold text-highlighted">
              Pilih kelas untuk diubah
            </h2>
            <ul class="mt-4 grid gap-2 sm:grid-cols-2">
              <li
                v-for="c in classes"
                :key="c.id"
              >
                <UButton
                  block
                  color="neutral"
                  variant="outline"
                  class="justify-between"
                  trailing-icon="i-lucide-chevron-right"
                  @click="selectedId = c.id"
                >
                  <span class="font-medium">{{ c.name }}</span>
                  <span class="text-muted text-sm">{{ c.students.length }} siswa</span>
                </UButton>
              </li>
            </ul>
          </div>
        </template>

        <div
          v-else
          class="space-y-4"
        >
          <div class="flex flex-wrap items-end gap-3">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              aria-label="Kembali ke daftar kelas"
              @click="selectedId = undefined"
            />
            <UFormField
              label="Nama kelas"
              class="grow"
            >
              <UInput
                v-model="draftName"
                class="w-full"
                @update:model-value="markDirty"
              />
            </UFormField>
            <UBadge
              v-if="isDirty"
              color="secondary"
              variant="subtle"
            >
              Belum disimpan
            </UBadge>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full min-w-[32rem] text-sm">
              <thead class="text-left text-muted">
                <tr>
                  <th class="py-2 pr-2 w-16 font-medium">
                    No.
                  </th>
                  <th class="py-2 pr-2 font-medium">
                    Nama lengkap
                  </th>
                  <th class="py-2 pr-2 w-36 font-medium">
                    Panggilan
                  </th>
                  <th class="py-2 pr-2 w-20 font-medium">
                    L/P
                  </th>
                  <th class="py-2 w-10">
                    <span class="sr-only">Hapus</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(s, i) in draftStudents"
                  :key="s.id"
                  class="border-t border-default"
                >
                  <td class="py-1.5 pr-2">
                    <UInput
                      v-model.number="s.number"
                      type="number"
                      min="1"
                      :aria-label="`Nomor absen baris ${i + 1}`"
                      @update:model-value="markDirty"
                    />
                  </td>
                  <td class="py-1.5 pr-2">
                    <UInput
                      v-model="s.name"
                      class="w-full"
                      :aria-label="`Nama lengkap baris ${i + 1}`"
                      @update:model-value="markDirty"
                    />
                  </td>
                  <td class="py-1.5 pr-2">
                    <UInput
                      v-model="s.nickname"
                      class="w-full"
                      :aria-label="`Nama panggilan baris ${i + 1}`"
                      @update:model-value="markDirty"
                    />
                  </td>
                  <td class="py-1.5 pr-2">
                    <USelect
                      v-model="s.gender"
                      :items="genderItems"
                      placeholder="-"
                      :aria-label="`Jenis kelamin baris ${i + 1}`"
                      @update:model-value="markDirty"
                    />
                  </td>
                  <td class="py-1.5">
                    <UTooltip text="Hapus siswa">
                      <UButton
                        icon="i-lucide-x"
                        color="neutral"
                        variant="ghost"
                        :aria-label="`Hapus ${s.name || `baris ${i + 1}`}`"
                        @click="removeStudent(s.id)"
                      />
                    </UTooltip>
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-if="draftStudents.length === 0"
              class="py-6 text-center text-sm text-muted"
            >
              Belum ada siswa. Tempel daftar dari Excel di kartu sebelah, atau tambah satu per satu.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              icon="i-lucide-user-plus"
              color="neutral"
              variant="outline"
              @click="addEmptyStudent"
            >
              Tambah siswa
            </UButton>
            <UButton
              icon="i-lucide-save"
              :loading="isSaving"
              :disabled="!isDirty"
              @click="save"
            >
              Simpan
            </UButton>
            <UButton
              v-if="isDirty"
              color="neutral"
              variant="ghost"
              @click="discard"
            >
              Batalkan perubahan
            </UButton>
            <UButton
              class="ms-auto"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="deleteOpen = true"
            >
              Hapus kelas
            </UButton>
          </div>
        </div>
      </UCard>

      <UCard
        v-if="!selected"
        class="sm:col-span-6 lg:col-span-4"
      >
        <form
          class="space-y-3"
          @submit.prevent="addClass"
        >
          <h2 class="font-semibold text-highlighted">
            Kelas baru
          </h2>
          <UFormField label="Nama kelas">
            <UInput
              v-model="newClassName"
              placeholder="Kelas 4A"
              class="w-full"
            />
          </UFormField>
          <UButton
            type="submit"
            icon="i-lucide-plus"
            :disabled="!newClassName.trim()"
          >
            Buat kelas
          </UButton>
          <UButton
            v-if="classes.length > 0 && !hasSample"
            color="neutral"
            variant="ghost"
            icon="i-lucide-flask-conical"
            @click="addSampleClass"
          >
            Isi kelas contoh
          </UButton>
        </form>
      </UCard>

      <UCard
        v-else
        class="sm:col-span-6 lg:col-span-4 lg:row-span-2"
      >
        <div class="space-y-3">
          <h2 class="font-semibold text-highlighted">
            Tempel dari Excel
          </h2>
          <p class="text-sm text-muted">
            Salin kolom nomor, nama, dan L/P dari Excel atau Google Sheets, lalu tempel di sini. Satu nama per baris juga bisa.
          </p>
          <UTextarea
            v-model="pasteText"
            :rows="8"
            class="w-full"
            aria-label="Tempel daftar siswa"
            placeholder="1&#9;Budi Santoso&#9;L&#10;2&#9;Siti Aminah&#9;P"
          />
          <div v-if="pasteText.trim()">
            <p class="text-sm text-toned">
              Terbaca {{ parsed.students.length }} siswa<span v-if="parsed.skipped.length">, {{ parsed.skipped.length }} baris dilewati karena tidak berisi nama</span>.
            </p>
            <ol class="mt-2 max-h-40 overflow-y-auto text-sm list-decimal ps-6">
              <li
                v-for="(s, i) in parsed.students"
                :key="i"
              >
                {{ s.name }}<span
                  v-if="s.gender"
                  class="text-muted"
                > ({{ s.gender }})</span>
              </li>
            </ol>
            <UButton
              class="mt-3"
              icon="i-lucide-clipboard-paste"
              :disabled="parsed.students.length === 0"
              @click="addParsed"
            >
              Tambahkan ke daftar
            </UButton>
          </div>
        </div>
      </UCard>
    </UPageGrid>

    <UModal
      v-model:open="deleteOpen"
      :title="`Hapus kelas ${selected?.name}?`"
      :description="`${selected?.students.length ?? 0} siswa di kelas ini akan dihapus dari perangkat. Unduh cadangan dulu kalau masih dibutuhkan.`"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="deleteOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            @click="confirmDelete"
          >
            Hapus kelas
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
