"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image src="/logo.svg" alt="Luna" width={40} height={40} />
            <h1 className="text-4xl font-bold text-gray-900">Luna CRM</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Komplett CRM-løsning for Meta Lead Ads, befaring-booking og kundeoppfølging
          </p>
        </div>

        {/* Demo Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              🚀 Prøv Luna Demo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Demo Login */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">
                  Direkte Demo-tilgang
                </h3>
                <p className="text-blue-700 mb-6 text-sm">
                  Automatisk innlogging til full demo med ekte data
                </p>
                <Link 
                  href="/demo"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Start Demo →
                </Link>
              </div>

              {/* Manual Login */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Manuell innlogging
                </h3>
                <div className="text-sm text-gray-700 mb-4">
                  <p><strong>E-post:</strong> demo@luna.no</p>
                  <p><strong>Passord:</strong> Demo123!</p>
                </div>
                <Link 
                  href="/"
                  className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg text-center transition-colors"
                >
                  Til Innlogging
                </Link>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600 text-sm">Real-time metrics og oversikt over alle leads</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-900 mb-2">Befaring Booking</h3>
              <p className="text-gray-600 text-sm">Automatisk kalenderbooking med ICS-eksport</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Lead Management</h3>
              <p className="text-gray-600 text-sm">Komplett oppfølging og kontakthistorikk</p>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center bg-gray-900 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-semibold mb-4">Interessert i Luna for ditt firma?</h3>
            <p className="text-gray-300 mb-6">
              Kontakt oss for personlig demo og tilpasset løsning
            </p>
            <a 
              href="mailto:amund@aiki.as"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Kontakt oss
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
