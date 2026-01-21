import React from "react";

export default function RiwayatList({ dataRiwayat }) {
    return(
    <div className="mt-8">
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <span>🐾</span> Jejak Keuangan
        </h3>
        <div className="space-y-3 h-64 overflow-y-auto pr-2 custom-scrollbar">
            {dataRiwayat.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
            <p>Belum ada transaksi.</p>
            <p className="text-xs mt-1">Ayo mulai nabung buat masa depan!</p>
        </div>
        ) : (
        dataRiwayat.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-lg flex justify-between items-center hover:bg-gray-100 transition">
              {/* Kiri: Ikon & Ket */}
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${item.tipe === 'MASUK' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {item.tipe === 'MASUK' ? '⬇️' : '⬆️'}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-black">
                            {item.tipe === 'MASUK' ? 'Tabungan Masuk' : 'Penarikan'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                            {item.waktu ? new Date(item.waktu).toLocaleString('id-ID') : '-'}
                        </p>
                    </div>
                </div>

                {/* Kanan: Nominal */}
                <span className={`font-bold text-sm ${item.tipe === 'MASUK' ? 'text-green-400' : 'text-red-400'}`}>
                    {item.tipe === 'MASUK' ? '+' : '-'} Rp {item.jumlah ? item.jumlah.toLocaleString('id-ID') : 0}
                </span>
            </div>
        ))
        )}
        </div>
    </div>
    );
}