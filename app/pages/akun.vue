<script setup lang="ts">
// Pengaturan akun: nama, foto profil, kata sandi, dan keluar. Hanya untuk pengguna yang sudah masuk
definePageMeta({ auth: 'user' })

useSeoMeta({
  title: 'Pengaturan akun',
  description: 'Ubah nama, foto profil, dan kata sandi akun Guru Kampung Anda.'
})

const { user, signOut, fetchSession, updateUser } = useUserSession()
const authClient = useAuthClient()
const toast = useToast()

const pesanGalat = (e: unknown) => (e instanceof Error ? e.message : 'Coba lagi beberapa saat lagi.')
const inisial = computed(() => (user.value?.name || user.value?.email || '?')
  .split(/\s+/).filter(Boolean).slice(0, 2).map(k => k[0]!.toUpperCase()).join(''))

// ---------- Nama
const nama = ref(user.value?.name ?? '')
watch(() => user.value?.name, (v) => {
  nama.value = v ?? ''
})
const namaBaru = computed(() => nama.value.trim())
const namaBerubah = computed(() => namaBaru.value.length > 0 && namaBaru.value !== user.value?.name)
const menyimpanNama = ref(false)

async function simpanNama() {
  if (!namaBerubah.value) return
  menyimpanNama.value = true
  try {
    await updateUser({ name: namaBaru.value })
    toast.add({ title: 'Nama tersimpan', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: 'Nama belum tersimpan', description: pesanGalat(e), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    menyimpanNama.value = false
  }
}

// ---------- Foto profil: dipotong persegi dan diperkecil ke 256px di peramban sebelum diunggah
const inputFoto = useTemplateRef<HTMLInputElement>('inputFoto')
const memprosesFoto = ref(false)

async function perkecilFoto(file: File): Promise<Blob> {
  const gambar = await createImageBitmap(file)
  const sisi = Math.min(gambar.width, gambar.height)
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  canvas.getContext('2d')!.drawImage(gambar, (gambar.width - sisi) / 2, (gambar.height - sisi) / 2, sisi, sisi, 0, 0, 256, 256)
  gambar.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Gambar tidak bisa diproses.'))), 'image/webp', 0.85)
  })
}

async function gantiFoto(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (inputFoto.value) inputFoto.value.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.add({ title: 'Pilih berkas gambar', description: 'Gunakan foto JPG, PNG, atau WebP.', color: 'warning', icon: 'i-lucide-image-off' })
    return
  }
  memprosesFoto.value = true
  try {
    const kecil = await perkecilFoto(file)
    const data = new FormData()
    data.append('foto', new File([kecil], 'foto', { type: kecil.type }))
    await $fetch('/api/akun/foto', { method: 'POST', body: data })
    await fetchSession({ force: true })
    toast.add({ title: 'Foto profil diperbarui', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: 'Foto belum terunggah', description: pesanGalat(e), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    memprosesFoto.value = false
  }
}

async function hapusFoto() {
  memprosesFoto.value = true
  try {
    await $fetch('/api/akun/foto', { method: 'DELETE' })
    await fetchSession({ force: true })
    toast.add({ title: 'Foto profil dihapus', color: 'neutral', icon: 'i-lucide-trash-2' })
  } catch (e) {
    toast.add({ title: 'Foto belum terhapus', description: pesanGalat(e), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    memprosesFoto.value = false
  }
}

// ---------- Kata sandi: hanya untuk akun yang mendaftar dengan email dan kata sandi
const { data: akunTertaut } = await useAsyncData('akun-tertaut', async () => {
  const hasil = await authClient?.listAccounts()
  return (hasil?.data ?? []) as { providerId: string }[]
}, { server: false, default: () => [] })
const punyaSandi = computed(() => akunTertaut.value.some(a => a.providerId === 'credential'))

const sandi = reactive({ lama: '', baru: '', ulang: '', keluarkanLain: true })
const menggantiSandi = ref(false)
const galatSandi = computed(() => {
  if (sandi.baru && sandi.baru.length < 8) return 'Kata sandi baru minimal 8 karakter.'
  if (sandi.ulang && sandi.ulang !== sandi.baru) return 'Ulangi kata sandi baru dengan tepat.'
  return ''
})
const sandiSiap = computed(() => sandi.lama && sandi.baru.length >= 8 && sandi.ulang === sandi.baru)

async function gantiSandi() {
  if (!sandiSiap.value || !authClient) return
  menggantiSandi.value = true
  try {
    const { error } = await authClient.changePassword({
      currentPassword: sandi.lama,
      newPassword: sandi.baru,
      revokeOtherSessions: sandi.keluarkanLain
    })
    if (error) throw new Error(error.message ?? 'Kata sandi lama tidak cocok.')
    Object.assign(sandi, { lama: '', baru: '', ulang: '' })
    toast.add({ title: 'Kata sandi diganti', color: 'success', icon: 'i-lucide-check' })
  } catch (e) {
    toast.add({ title: 'Kata sandi belum diganti', description: pesanGalat(e), color: 'error', icon: 'i-lucide-circle-alert' })
  } finally {
    menggantiSandi.value = false
  }
}

// ---------- Keluar
const keluar = ref(false)
async function keluarAkun() {
  keluar.value = true
  await signOut({ onSuccess: () => navigateTo('/') })
  keluar.value = false
}
</script>

<template>
  <div class="space-y-6">
    <PageTitle
      title="Pengaturan akun"
      description="Nama dan foto profil tampil di dashboard dan bukti langganan. Data kelas tetap tersimpan di perangkat Anda."
      illustration="kartu-nama"
    />

    <div class="grid gap-6 lg:grid-cols-12">
      <!-- Profil -->
      <section
        aria-labelledby="judul-profil"
        class="panel-kertas space-y-6 p-5 sm:p-7 lg:col-span-7"
      >
        <h2
          id="judul-profil"
          class="font-display text-2xl font-bold text-highlighted"
        >
          Profil
        </h2>

        <div class="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div class="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-(--color-tinta) bg-(--color-pensil) shadow-[0_4px_0_0_var(--color-tinta)]">
            <img
              v-if="user?.image"
              :key="user.image"
              :src="user.image"
              :alt="`Foto profil ${user.name}`"
              class="hasil-muncul size-full object-cover"
            >
            <span
              v-else
              class="flex size-full items-center justify-center font-display text-4xl font-extrabold text-slate-900"
              aria-hidden="true"
            >{{ inisial }}</span>
            <span
              v-if="memprosesFoto"
              class="absolute inset-0 flex items-center justify-center bg-white/70"
            >
              <UIcon
                name="i-lucide-loader-circle"
                class="size-8 animate-spin text-slate-900"
              />
            </span>
          </div>

          <div class="space-y-3">
            <div class="flex flex-wrap gap-2.5">
              <UButton
                icon="i-lucide-image-up"
                class="stiker-tombol"
                :disabled="memprosesFoto"
                @click="inputFoto?.click()"
              >
                {{ user?.image ? 'Ganti foto' : 'Unggah foto' }}
              </UButton>
              <UButton
                v-if="user?.image"
                icon="i-lucide-trash-2"
                color="neutral"
                variant="outline"
                class="stiker-tombol bg-white"
                :disabled="memprosesFoto"
                @click="hapusFoto"
              >
                Hapus foto
              </UButton>
            </div>
            <p class="text-sm text-muted">
              JPG, PNG, atau WebP. Foto dipotong persegi dan diperkecil otomatis sebelum diunggah.
            </p>
            <input
              ref="inputFoto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="sr-only"
              aria-label="Pilih foto profil"
              @change="gantiFoto"
            >
          </div>
        </div>

        <form
          class="space-y-4"
          @submit.prevent="simpanNama"
        >
          <UFormField
            label="Nama"
            hint="Tampil di dashboard dan bukti langganan"
          >
            <UInput
              v-model="nama"
              autocomplete="name"
              maxlength="80"
              class="w-full"
            />
          </UFormField>
          <UFormField
            label="Email"
            hint="Email tidak bisa diubah"
          >
            <UInput
              :model-value="user?.email ?? ''"
              disabled
              class="w-full"
            />
          </UFormField>
          <UButton
            type="submit"
            icon="i-lucide-save"
            class="stiker-tombol"
            :loading="menyimpanNama"
            :disabled="!namaBerubah"
          >
            Simpan nama
          </UButton>
        </form>
      </section>

      <div class="space-y-6 lg:col-span-5">
        <!-- Kata sandi -->
        <section
          aria-labelledby="judul-sandi"
          class="panel-kertas space-y-4 p-5 sm:p-7"
        >
          <h2
            id="judul-sandi"
            class="font-display text-2xl font-bold text-highlighted"
          >
            Kata sandi
          </h2>

          <form
            v-if="punyaSandi"
            class="space-y-4"
            @submit.prevent="gantiSandi"
          >
            <UFormField label="Kata sandi sekarang">
              <UInput
                v-model="sandi.lama"
                type="password"
                autocomplete="current-password"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Kata sandi baru">
              <UInput
                v-model="sandi.baru"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Ulangi kata sandi baru"
              :error="galatSandi || undefined"
            >
              <UInput
                v-model="sandi.ulang"
                type="password"
                autocomplete="new-password"
                class="w-full"
              />
            </UFormField>
            <UCheckbox
              v-model="sandi.keluarkanLain"
              label="Keluarkan akun ini dari perangkat lain"
            />
            <UButton
              type="submit"
              icon="i-lucide-key-round"
              class="stiker-tombol"
              :loading="menggantiSandi"
              :disabled="!sandiSiap"
            >
              Ganti kata sandi
            </UButton>
          </form>
          <p
            v-else
            class="text-sm text-toned"
          >
            Anda masuk dengan Google atau tautan email, jadi tidak ada kata sandi untuk diganti di sini.
          </p>
        </section>

        <!-- Keluar -->
        <section
          aria-labelledby="judul-keluar"
          class="panel-kertas space-y-3 p-5 sm:p-7"
        >
          <h2
            id="judul-keluar"
            class="font-display text-2xl font-bold text-highlighted"
          >
            Keluar
          </h2>
          <p class="text-sm text-toned">
            Data kelas di perangkat ini tidak terhapus saat Anda keluar.
          </p>
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="outline"
            class="stiker-tombol bg-white"
            :loading="keluar"
            @click="keluarAkun"
          >
            Keluar dari akun
          </UButton>
        </section>
      </div>
    </div>
  </div>
</template>
