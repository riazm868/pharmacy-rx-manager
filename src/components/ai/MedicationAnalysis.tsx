'use client';

import { useState, useEffect } from 'react';
import { MedicationAnalysis as MedicationAnalysisType, MedicationInteraction } from '@/services/aiService';
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface MedicationAnalysisProps {
  analysis: MedicationAnalysisType | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function MedicationAnalysis({ analysis, isLoading, error }: MedicationAnalysisProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getSeverityColor = (severity: MedicationInteraction['severity']) => {
    switch (severity) {
      case 'severe':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'mild':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: MedicationInteraction['severity']) => {
    switch (severity) {
      case 'severe':
        return <AlertCircle className="h-5 w-5" />;
      case 'moderate':
        return <AlertTriangle className="h-5 w-5" />;
      case 'mild':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Medication Tags */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Medication Categories</h3>
        <div className="flex flex-wrap gap-2">
          {analysis.medications.map((med, index) => (
            <div
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              <span className="font-medium">{med.name}</span>
              <span className="mx-2">•</span>
              <span>{med.category || med.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drug Interactions */}
      {analysis.interactions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
            Drug Interactions Detected
          </h3>
          <div className="space-y-3">
            {analysis.interactions.map((interaction, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getSeverityColor(interaction.severity)}`}
              >
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">
                    {getSeverityIcon(interaction.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">
                      {interaction.medication1} + {interaction.medication2}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium capitalize">{interaction.severity}:</span>{' '}
                      {interaction.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dosage Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Dosage Recommendations
          </h3>
          <div className="space-y-4">
            {analysis.recommendations.map((rec, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <div className="font-medium text-gray-900">{rec.medication}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Recommended dose:</span> {rec.recommendedDose} {rec.frequency}
                </div>
                {rec.warnings && rec.warnings.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium text-gray-700">Important notes:</div>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {rec.warnings.map((warning, wIndex) => (
                        <li key={wIndex}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
