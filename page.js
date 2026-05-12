'use client';

import React, { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Veuillez sélectionner un fichier PDF valide');
    }
  };

  const generateSTL = (dimensions) => {
    const { width, height, depth } = dimensions;
    const scale = 10;
    const w = width * scale;
    const h = height * scale;
    const d = depth * scale;

    let stl = 'solid panel\n';

    const vertices = [
      [0, 0, 0], [w, 0, 0], [w, h, 0], [0, h, 0],
      [0, 0, d], [w, 0, d], [w, h, d], [0, h, d]
    ];

    const faces = [
      [0, 1, 2], [0, 2, 3],
      [4, 6, 5], [4, 7, 6],
      [0, 4, 5], [0, 5, 1],
      [2, 6, 7], [2, 7, 3],
      [0, 3, 7], [0, 7, 4],
      [1, 5, 6], [1, 6, 2]
    ];

    for (const face of faces) {
      const v0 = vertices[face[0]];
      const v1 = vertices[face[1]];
      const v2 = vertices[face[2]];

      const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
      const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
      const normal = [
        e1[1] * e2[2] - e1[2] * e2[1],
        e1[2] * e2[0] - e1[0] * e2[2],
        e1[0] * e2[1] - e1[1] * e2[0]
      ];
      const len = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);
      const n = [normal[0] / len, normal[1] / len, normal[2] / len];

      stl += `  facet normal ${n[0].toFixed(4)} ${n[1].toFixed(4)} ${n[2].toFixed(4)}\n`;
      stl += '    outer loop\n';
      stl += `      vertex ${v0[0].toFixed(4)} ${v0[1].toFixed(4)} ${v0[2].toFixed(4)}\n`;
      stl += `      vertex ${v1[0].toFixed(4)} ${v1[1].toFixed(4)} ${v1[2].toFixed(4)}\n`;
      stl += `      vertex ${v2[0].toFixed(4)} ${v2[1].toFixed(4)} ${v2[2].toFixed(4)}\n`;
      stl += '    endloop\n';
      stl += '  endfacet\n';
    }

    stl += 'endsolid panel\n';
    return stl;
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier PDF');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pdf: base64 })
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur lors de l\'analyse');
          setResult(null);
          setLoading(false);
          return;
        }

        try {
          const stlContent = generateSTL(data.dimensions);
          const blob = new Blob([stlContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);

          setResult({
            dimensions: data.dimensions,
            downloadUrl: url,
            fileName: `panel_${Math.floor(data.dimensions.width)}x${Math.floor(data.dimensions.height)}.stl`
          });
        } catch (e) {
          setError('Impossible de générer le fichier 3D. Vérifie que le PDF contient des dimensions claires.');
          setResult(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erreur: ' + err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: '#1a1a1a'
        }}>
          PDF → Fichier 3D
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '2rem',
          fontSize: '14px'
        }}>
          Convertis tes plans en fichiers STL pour ton CNC
        </p>

        <div style={{
          background: '#f5f5f5',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.background = '#f0f0f0';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.background = '#f5f5f5';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFile = e.dataTransfer.files[0];
          if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile);
            setError(null);
          }
        }}
        >
          <label style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <span style={{ 
              color: '#333', 
              fontWeight: '500',
              display: 'block'
            }}>
              {file ? `✓ ${file.name}` : 'Clique ou glisse un PDF'}
            </span>
          </label>
        </div>

        {error && (
          <div style={{
            background: '#ffe6e6',
            color: '#cc0000',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '14px',
            border: '1px solid #ff9999'
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={!file || loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: file && !loading ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#ddd',
            color: file && !loading ? 'white' : '#999',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: file && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            fontSize: '16px'
          }}
          onMouseOver={(e) => {
            if (file && !loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {loading ? '⏳ Analyse en cours...' : '🚀 Analyser le PDF'}
        </button>

        {result && (
          <div style={{
            background: '#e6ffe6',
            border: '1px solid #99ff99',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ color: '#009900', fontWeight: '600', marginBottom: '12px' }}>
              ✓ Fichier 3D généré !
            </div>

            <div style={{
              background: 'white',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '12px',
              fontSize: '14px',
              border: '1px solid #ddd'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '12px' }}>Dimensions extraites:</p>
              <p style={{ margin: '4px 0', color: '#333' }}>
                <strong>Largeur:</strong> {Math.round(result.dimensions.width)} mm
              </p>
              <p style={{ margin: '4px 0', color: '#333' }}>
                <strong>Hauteur:</strong> {Math.round(result.dimensions.height)} mm
              </p>
              <p style={{ margin: '4px 0', color: '#333' }}>
                <strong>Profondeur:</strong> {Math.round(result.dimensions.depth)} mm
              </p>
            </div>

            <a
              href={result.downloadUrl}
              download={result.fileName}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                background: '#009900',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#007700';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#009900';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ⬇️ Télécharger {result.fileName}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
