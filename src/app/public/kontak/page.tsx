'use client';

import { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      // Simulasi API call dengan timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulasi sukses
      console.log('Form submitted:', formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      setSubmitError('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <div className="relative bg-blue-700">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover opacity-30"
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80"
            alt="Kontak Kami"
          />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Hubungi Kami
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-blue-50">
            Kami siap membantu Anda dengan segala pertanyaan dan kebutuhan pengiriman Anda
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Informasi Kontak</h2>
            <p className="mt-4 text-lg leading-6 text-gray-600">
              Hubungi kami untuk informasi lebih lanjut mengenai layanan pengiriman barang kami
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex gap-x-3">
                <MapPinIcon className="h-7 w-6 flex-none text-blue-600" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900">Kantor Pusat</h3>
                  <p className="mt-1 text-gray-600">Jl. Ekspedisi No. 123, Kotabaru, Jakarta Pusat, 10350</p>
                </div>
              </div>
              <div className="flex gap-x-3">
                <PhoneIcon className="h-7 w-6 flex-none text-blue-600" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900">Telepon</h3>
                  <p className="mt-1 text-gray-600">+62 812-3456-7890 (Layanan Pelanggan)</p>
                  <p className="mt-1 text-gray-600">+62 21-3456-7890 (Kantor)</p>
                </div>
              </div>
              <div className="flex gap-x-3">
                <EnvelopeIcon className="h-7 w-6 flex-none text-blue-600" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="mt-1 text-gray-600">info@wuzz.co.id</p>
                  <p className="mt-1 text-gray-600">cs@wuzz.co.id</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-900">Jam Operasional</h3>
              <dl className="mt-3 space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <dt>Senin - Jumat</dt>
                  <dd>08:00 - 18:00</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Sabtu</dt>
                  <dd>09:00 - 15:00</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Minggu & Hari Libur</dt>
                  <dd>Tutup</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-8 shadow-md rounded-lg border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Kirim Pesan</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">Pesan Anda telah berhasil dikirim. Kami akan menghubungi Anda segera.</p>
                </div>
              )}
              
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{submitError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                <div className="sm:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      required
                      className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                      className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Nomor Telepon
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                    Subjek
                  </label>
                  <div className="mt-1">
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Pilih Subjek</option>
                      <option value="customer-service">Layanan Pelanggan</option>
                      <option value="tracking">Tracking Kiriman</option>
                      <option value="complaint">Keluhan</option>
                      <option value="business">Kerjasama Bisnis</option>
                      <option value="other">Lainnya</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Pesan
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full inline-flex items-center justify-center rounded-md border border-transparent ${
                      isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } px-6 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Map Embed */}
      <div className="mt-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Lokasi Kami</h2>
        <div className="h-96 w-full bg-gray-200 rounded-lg overflow-hidden shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126932.01184426472!2d106.73084476668358!3d-6.226285355697801!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta%20Pusat%2C%20Kota%20Jakarta%20Pusat%2C%20Daerah%20Khusus%20Ibukota%20Jakarta!5e0!3m2!1sid!2sid!4v1655196357188!5m2!1sid!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
} 