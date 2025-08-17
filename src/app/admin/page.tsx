/**
 * Admin Page - AI Configuration and Testing
 */
"use client";

import React from 'react';
import Link from 'next/link';
import { AIConfigPanel } from '@/components/admin/AIConfigPanel';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Puck Editor - Admin Panel
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/editor"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Open Editor
              </Link>
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            AI Configuration & Testing
          </h2>
          <p className="text-gray-600">
            Configure and test your AI API integration. Make sure to set up your environment variables before testing.
          </p>
        </div>

        <AIConfigPanel />

        {/* Additional Admin Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Data Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              View and manage AI-generated content data.
            </p>
            <Link
              href="/api/ai-data"
              target="_blank"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View AI Data →
            </Link>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">API Documentation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Learn about the AI generation API endpoints.
            </p>
            <div className="space-y-1 text-sm">
              <div><code className="text-xs bg-gray-100 px-1 rounded">POST /api/generate-ai</code></div>
              <div><code className="text-xs bg-gray-100 px-1 rounded">GET /api/ai-data</code></div>
              <div><code className="text-xs bg-gray-100 px-1 rounded">GET /api/ai-test</code></div>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">System Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Monitor system health and performance.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Editor: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>AI API: Test Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
