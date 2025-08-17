/**
 * Home Page - Landing page with navigation to editor
 */
"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Puck Editor
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A powerful visual editor with AI-powered content generation. 
            Build beautiful pages with drag-and-drop components and intelligent content assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/editor"
              className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Open Editor
            </Link>
            
            <a
              href="https://github.com/your-repo/puck-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Visual Editor
            </h3>
            <p className="text-gray-600">
              Drag and drop components to build beautiful pages without coding.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered
            </h3>
            <p className="text-gray-600">
              Generate content automatically with AI assistance for faster development.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Sync
            </h3>
            <p className="text-gray-600">
              Changes sync in real-time with live updates and data persistence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
