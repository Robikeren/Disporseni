import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TL</span>
            </div>
            <span className="font-semibold text-gray-900">
              Tech<span className="text-green-600">Leaf</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors rounded-lg hover:bg-gray-100"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Daftar
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full mb-6">
            Sustainable Digital Business DISPORSENI UT 2026
          </span>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-5 tracking-tight">
            Dari Limbah Jadi Solusi,<br />
            <span className="text-green-600">Dari Lokal Jadi Global</span>
          </h1>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            TechLeaf mengubah limbah tembakau Jember menjadi bioinsektisida organik bernilai tinggi,
            didistribusikan melalui platform digital yang menghubungkan petani, pengolah, dan buyer dalam satu ekosistem.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              Mulai Sekarang
            </button>
            <button
              onClick={() => document.getElementById('produk').scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Lihat Produk
            </button>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="border-t border-gray-100" />

      {/* STATS */}
      <section className="py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { angka: '27.251', satuan: 'Ton', label: 'Produksi tembakau Jember per tahun' },
            { angka: '14,6%', satuan: 'CAGR', label: 'Pertumbuhan pasar biopestisida global' },
            { angka: '3', satuan: 'Varian', label: 'Produk Basic, Pro, dan Bulk' },
            { angka: '50%', satuan: 'Margin', label: 'Margin kotor produk TechLeaf Basic' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">{s.angka}</div>
              <div className="text-xs font-medium text-green-600 mb-1">{s.satuan}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* CARA KERJA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Bagaimana TechLeaf Bekerja</h2>
            <p className="text-gray-400 text-sm">Ekosistem digital yang menghubungkan tiga aktor utama</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: '01',
                judul: 'Petani Tembakau',
                deskripsi: 'Laporkan stok limbah tembakau batang, tulang daun, sisa rajangan dan dapatkan penghasilan tambahan dari limbah yang selama ini terbuang.',
              },
              {
                step: '02',
                judul: 'Unit Pengolah TechLeaf',
                deskripsi: 'Limbah dikumpulkan, diekstrak nikotinnya, dan diformulasikan menjadi bioinsektisida organik berkualitas tinggi siap distribusi.',
              },
              {
                step: '03',
                judul: 'Petani Hortikultura',
                deskripsi: 'Dapatkan bioinsektisida organik terjangkau dengan traceability lengkap cocok untuk sertifikasi organik dan pasar ekspor.',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-green-100 hover:bg-green-50/30 transition-all">
                <div className="text-xs font-bold text-green-600 mb-3">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.judul}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* PRODUK */}
      <section id="produk" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Produk TechLeaf</h2>
            <p className="text-gray-400 text-sm">Bioinsektisida organik berbasis nikotin untuk berbagai kebutuhan</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                nama: 'TechLeaf Basic',
                kemasan: '500 ml',
                harga: 'Rp 18.000',
                satuan: '/liter',
                target: 'Petani kecil-menengah',
                highlight: false,
                fitur: ['Mudah diaplikasikan', 'Efektif untuk hama umum', 'Harga paling terjangkau'],
              },
              {
                nama: 'TechLeaf Pro',
                kemasan: '1 liter',
                harga: 'Rp 25.000',
                satuan: '/liter',
                target: 'Pasar ekspor & organik',
                highlight: true,
                fitur: ['Formulasi siap semprot', 'Cocok sertifikasi organik', 'Traceability lengkap'],
              },
              {
                nama: 'TechLeaf Bulk',
                kemasan: 'Jerigen 5 liter',
                harga: 'Rp 15.000',
                satuan: '/liter',
                target: 'Distributor & koperasi',
                highlight: false,
                fitur: ['Harga grosir efisien', 'Kemasan volume besar', 'Cocok untuk reseller'],
              },
            ].map((p, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border transition-all ${
                  p.highlight
                    ? 'border-green-200 bg-green-50 ring-1 ring-green-200'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {p.highlight && (
                  <span className="inline-block px-2 py-0.5 bg-green-600 text-white text-xs font-medium rounded-full mb-3">
                    Paling Populer
                  </span>
                )}
                <div className="text-xs text-gray-400 mb-1">{p.kemasan}</div>
                <h3 className="font-bold text-gray-900 mb-1">{p.nama}</h3>
                <div className="mb-1">
                  <span className="text-xl font-bold text-gray-900">{p.harga}</span>
                  <span className="text-xs text-gray-400">{p.satuan}</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-4">{p.target}</div>
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {p.fitur.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/register')}
                  className={`mt-5 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    p.highlight
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Pesan Sekarang
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* FITUR PLATFORM */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Fitur Platform</h2>
            <p className="text-gray-400 text-sm">Semua yang kamu butuhkan dalam satu ekosistem digital</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { judul: 'Waste Supply Management', deskripsi: 'Petani dapat melaporkan ketersediaan stok limbah secara real-time langsung dari platform.' },
              { judul: 'Traceability Chain', deskripsi: 'Lacak asal limbah, proses produksi, hingga distribusi produk akhir secara transparan.' },
              { judul: 'Digital Marketplace', deskripsi: 'Katalog produk, pemesanan, pembayaran, dan tracking pengiriman dalam satu platform.' },
              { judul: 'Dashboard Pendapatan', deskripsi: 'Petani mitra mendapat laporan pendapatan dari limbah secara otomatis dan real-time.' },
              { judul: 'Verifikasi Kebun', deskripsi: 'Sistem verifikasi digital untuk memastikan kualitas dan keaslian sumber limbah tembakau.' },
              { judul: 'Konsultasi Agronomis', deskripsi: 'Akses panduan penggunaan bioinsektisida dari tenaga ahli pertanian berpengalaman.' },
            ].map((f, i) => (
              <div key={i} className="p-5 bg-white rounded-xl border border-gray-100">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.judul}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            Siap bergabung dengan TechLeaf?
          </h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            Daftar sekarang dan jadilah bagian dari ekosistem pertanian organik berkelanjutan berbasis teknologi digital.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
            >
              Daftar Gratis
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Masuk
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">TL</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Tech<span className="text-green-600">Leaf</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © 2026 TechLeaf Universitas Terbuka · DISPORSENI 2026
          </p>
          <p className="text-xs text-gray-400">
            Dari Limbah Jadi Solusi, Dari Lokal Jadi Global
          </p>
        </div>
      </footer>

    </div>
  )
}

export default LandingPage