<script setup lang="ts">
useSeoMeta({
  title: 'Masuk ke Guru Kampung',
  description: 'Masuk dengan akun Google belajar.id, tautan email tanpa kata sandi, atau email dan kata sandi untuk membuka alat AI.'
})

const toast = useToast()

type TabAuth = 'tautan' | 'sandi' | 'daftar' | 'lupa'
const modeAktif = ref<TabAuth>('tautan')

const form = reactive({
  nama: '',
  email: '',
  sandi: ''
})

const tautanTerkirim = ref(false)
const sedangMemproses = ref(false)

// Ambil klien Better Auth jika modul @nuxtjs/better-auth sudah aktif setelah bun install
function ambilAuthClient(): any {
  const fn = (globalThis as Record<string, unknown>).useAuthClient
  return typeof fn === 'function' ? fn() : null
}

async function masukGoogle() {
  sedangMemproses.value = true
  try {
    const client = ambilAuthClient()
    if (client?.signIn?.social) {
      await client.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard'
      })
      return
    }
    toast.add({
      title: 'Simulasi Masuk dengan Google (belajar.id)',
      description: 'Di produksi, Better Auth mengarahkan ke Google OAuth lalu kembali ke Dashboard (PRD A-01).',
      color: 'success',
      icon: 'i-lucide-check'
    })
    await navigateTo('/dashboard')
  } finally {
    sedangMemproses.value = false
  }
}

async function kirimTautanEmail() {
  if (!form.email.trim()) return
  sedangMemproses.value = true
  try {
    const client = ambilAuthClient()
    if (client?.signIn?.magicLink) {
      await client.signIn.magicLink({
        email: form.email.trim(),
        callbackURL: '/dashboard'
      })
    }
    tautanTerkirim.value = true
    toast.add({
      title: 'Tautan masuk dikirim',
      description: `Periksa kotak masuk ${form.email}. Tautan berlaku 15 menit dan hanya sekali pakai (PRD A-02).`,
      color: 'success',
      icon: 'i-lucide-mail-check'
    })
  } finally {
    sedangMemproses.value = false
  }
}

async function kirimFormSandi() {
  if (!form.email.trim()) return
  sedangMemproses.value = true
  try {
    const client = ambilAuthClient()

    if (modeAktif.value === 'lupa') {
      if (client?.forgetPassword) {
        await client.forgetPassword({
          email: form.email.trim(),
          redirectTo: '/masuk'
        })
      }
      toast.add({
        title: 'Tautan atur ulang kata sandi dikirim',
        description: `Kami mengirim petunjuk ke ${form.email} (PRD A-03).`,
        color: 'success',
        icon: 'i-lucide-mail'
      })
      modeAktif.value = 'sandi'
      return
    }

    if (modeAktif.value === 'daftar') {
      if (client?.signUp?.email) {
        await client.signUp.email({
          name: form.nama.trim() || form.email.split('@')[0],
          email: form.email.trim(),
          password: form.sandi
        })
      }
      toast.add({
        title: 'Verifikasi email dikirim',
        description: `Buka email ${form.email} untuk mengaktifkan akun Guru Kampung Anda (PRD A-03).`,
        color: 'success',
        icon: 'i-lucide-user-plus'
      })
      await navigateTo('/dashboard')
      return
    }

    if (client?.signIn?.email) {
      await client.signIn.email({
        email: form.email.trim(),
        password: form.sandi
      })
    }
    toast.add({
      title: 'Berhasil masuk',
      description: `Selamat datang kembali, ${form.email}.`,
      color: 'success',
      icon: 'i-lucide-check'
    })
    await navigateTo('/dashboard')
  } finally {
    sedangMemproses.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <PageTitle
      title="Masuk ke Guru Kampung"
      description="Alat kelas harian bisa langsung dipakai gratis tanpa daftar. Masuk hanya diperlukan untuk membuka alat berbasis AI dan mengelola langganan."
      badge="Akun Guru (PRD 7.2)"
      icon="i-lucide-key-round"
      illustration="kartu-nama"
    />

    <UPageGrid>
      <!-- Satu-satunya kartu 2x2 di halaman ini (DESIGN.md): Formulir Masuk & Daftar -->
      <div class="panel-kertas space-y-6 p-6 sm:col-span-6 sm:p-8 lg:col-span-7 lg:row-span-2">
        <!-- 1. Masuk dengan Google / belajar.id (PRD A-01) -->
        <div class="space-y-2.5">
          <p class="langkah-judul">
            <span class="langkah-nomor">1</span> Cara tercepat untuk guru
          </p>
          <UButton
            block
            size="xl"
            color="primary"
            icon="i-lucide-chrome"
            class="stiker-tombol"
            @click="masukGoogle"
          >
            Masuk dengan Google / Akun belajar.id
          </UButton>
          <p class="text-xs text-muted">
            Akun <strong>@guru.sd.belajar.id</strong> adalah akun Google, jadi bisa langsung dipakai tanpa membuat kata sandi baru (PRD A-01).
          </p>
        </div>

        <div class="relative flex items-center py-1">
          <div class="grow border-t border-default" />
          <span class="mx-3 shrink-0 text-xs font-semibold text-muted">atau lewat email</span>
          <div class="grow border-t border-default" />
        </div>

        <!-- Pilihan metode email: Tautan Masuk (A-02), Kata Sandi (A-03), Daftar (A-03) -->
        <div class="space-y-4">
          <div
            role="tablist"
            aria-label="Pilih cara masuk dengan email"
            class="flex flex-wrap gap-2"
          >
            <UButton
              size="sm"
              :color="modeAktif === 'tautan' ? 'secondary' : 'neutral'"
              :variant="modeAktif === 'tautan' ? 'solid' : 'outline'"
              icon="i-lucide-wand-sparkles"
              class="stiker-tombol"
              @click="modeAktif = 'tautan'; tautanTerkirim = false"
            >
              Tautan Email (Tanpa Sandi)
            </UButton>
            <UButton
              size="sm"
              :color="modeAktif === 'sandi' ? 'secondary' : 'neutral'"
              :variant="modeAktif === 'sandi' ? 'solid' : 'outline'"
              icon="i-lucide-lock"
              class="stiker-tombol"
              @click="modeAktif = 'sandi'"
            >
              Email & Kata Sandi
            </UButton>
            <UButton
              size="sm"
              :color="modeAktif === 'daftar' ? 'secondary' : 'neutral'"
              :variant="modeAktif === 'daftar' ? 'solid' : 'outline'"
              icon="i-lucide-user-plus"
              class="stiker-tombol"
              @click="modeAktif = 'daftar'"
            >
              Daftar Akun Baru
            </UButton>
          </div>

          <!-- Mode A-02: Tautan masuk lewat email -->
          <div
            v-if="modeAktif === 'tautan'"
            class="space-y-4"
          >
            <div
              v-if="tautanTerkirim"
              class="rounded-2xl border-2 border-(--color-tinta) bg-yellow-50 p-4 space-y-2 dark:bg-slate-800"
            >
              <p class="font-display text-base font-bold text-highlighted">
                Cek kotak masuk email Anda
              </p>
              <p class="text-sm text-toned">
                Kami telah mengirim tautan masuk sekali pakai ke <strong>{{ form.email }}</strong>. Klik tautan tersebut untuk langsung membuka Guru Kampung tanpa kata sandi.
              </p>
              <div class="flex flex-wrap gap-2 pt-1">
                <UButton
                  to="/dashboard"
                  size="xs"
                  color="primary"
                  class="stiker-tombol"
                >
                  Simulasi Klik Tautan (Ke Dashboard)
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="outline"
                  class="stiker-tombol"
                  @click="tautanTerkirim = false"
                >
                  Ganti email
                </UButton>
              </div>
            </div>

            <form
              v-else
              class="space-y-4"
              @submit.prevent="kirimTautanEmail"
            >
              <UFormField
                label="Alamat email guru"
                required
              >
                <UInput
                  v-model="form.email"
                  type="email"
                  placeholder="nama@guru.sd.belajar.id atau @gmail.com"
                  class="w-full"
                />
              </UFormField>
              <UButton
                type="submit"
                block
                size="lg"
                color="neutral"
                icon="i-lucide-send"
                class="stiker-tombol bg-(--color-pensil) text-slate-900"
              >
                Kirim Tautan Masuk ke Email
              </UButton>
              <p class="text-xs text-muted">
                Tidak perlu menghafal kata sandi. Tautan hanya berlaku sebentar dan sekali pakai (PRD A-02).
              </p>
            </form>
          </div>

          <!-- Mode A-03: Email & kata sandi / Daftar / Lupa kata sandi -->
          <form
            v-else
            class="space-y-4"
            @submit.prevent="kirimFormSandi"
          >
            <UFormField
              v-if="modeAktif === 'daftar'"
              label="Nama lengkap guru"
              required
            >
              <UInput
                v-model="form.nama"
                placeholder="Contoh: Siti Aminah, S.Pd."
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Alamat email"
              required
            >
              <UInput
                v-model="form.email"
                type="email"
                placeholder="nama@guru.sd.belajar.id"
                class="w-full"
              />
            </UFormField>

            <UFormField
              v-if="modeAktif !== 'lupa'"
              :label="modeAktif === 'daftar' ? 'Buat kata sandi (minimal 8 karakter)' : 'Kata sandi'"
              required
            >
              <UInput
                v-model="form.sandi"
                type="password"
                placeholder="Minimal 8 karakter"
                class="w-full"
              />
            </UFormField>

            <div class="flex flex-wrap items-center justify-between gap-2">
              <UButton
                type="submit"
                size="lg"
                color="primary"
                icon="i-lucide-arrow-right"
                class="stiker-tombol"
              >
                {{ modeAktif === 'daftar'
                  ? 'Daftar & Kirim Verifikasi'
                  : modeAktif === 'lupa'
                    ? 'Kirim Tautan Atur Ulang Sandi'
                    : 'Masuk dengan Kata Sandi' }}
              </UButton>

              <button
                v-if="modeAktif === 'sandi'"
                type="button"
                class="text-xs font-semibold text-primary underline"
                @click="modeAktif = 'lupa'"
              >
                Lupa kata sandi?
              </button>
              <button
                v-else-if="modeAktif === 'lupa'"
                type="button"
                class="text-xs font-semibold text-primary underline"
                @click="modeAktif = 'sandi'"
              >
                Kembali ke masuk kata sandi
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Penjelasan Satu Email = Satu Akun (PRD A-04) & Privasi -->
      <div class="panel-kertas space-y-3 p-6 sm:col-span-6 lg:col-span-5">
        <h2 class="font-display text-lg font-bold text-highlighted">
          Satu Email, Satu Akun (PRD A-04)
        </h2>
        <p class="text-sm text-toned">
          Pernah mendaftar dengan email biasa lalu besoknya masuk memakai tombol Google dengan email yang sama? Keduanya otomatis digabung menjadi satu akun yang sama beserta paket langganannya.
        </p>
      </div>

      <div class="panel-kertas space-y-3 p-6 sm:col-span-6 lg:col-span-5">
        <h2 class="font-display text-lg font-bold text-highlighted">
          Mau Pakai Alat Harian Saja?
        </h2>
        <p class="text-sm text-toned">
          Timer kelas, pemilih siswa acak, pembagi kelompok, dadu, kalkulator nilai rapor, dan 25+ alat non-AI tetap gratis penuh tanpa perlu membuat akun.
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <UButton
            to="/alat"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-layout-grid"
            class="stiker-tombol"
          >
            Langsung Pakai Alat Gratis
          </UButton>
          <UButton
            to="/paket"
            color="neutral"
            variant="outline"
            size="sm"
            icon="i-lucide-sparkles"
            class="stiker-tombol"
          >
            Lihat Paket AI
          </UButton>
        </div>
      </div>
    </UPageGrid>
  </div>
</template>

