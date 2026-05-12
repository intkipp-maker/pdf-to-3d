export const metadata = {
  title: 'PDF to 3D - Convertisseur de Plans',
  description: 'Convertis tes plans PDF en fichiers 3D STL pour ton CNC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
