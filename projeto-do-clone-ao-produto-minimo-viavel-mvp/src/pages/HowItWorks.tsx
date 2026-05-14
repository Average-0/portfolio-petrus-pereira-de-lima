import * as React from 'react';
import { Info, Shield, Zap, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight text-gray-100">Como funciona?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          O MData Explorer utiliza tecnologias modernas de processamento no navegador para garantir que seus dados nunca saiam do seu dispositivo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="border-gray-700 bg-gray-800/50">
          <CardHeader>
            <Shield className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-xl text-gray-100">Privacidade Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Diferente de outros sites, não fazemos upload de suas imagens. Todo o processamento EXIF acontece localmente no seu navegador.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800/50">
          <CardHeader>
            <Zap className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-xl text-gray-100">Velocidade Instantânea</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Sem tempo de espera para upload ou download. Os metadados são extraídos em milissegundos assim que você seleciona o arquivo.
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-gray-800/50">
          <CardHeader>
            <Database className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-xl text-gray-100">Dados Completos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Suporte total para EXIF, IPTC, XMP e dados de GPS, incluindo informações de câmera, lentes e configurações de exposição.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 md:p-12 space-y-8">
        <div className="flex items-center gap-3">
          <Info className="h-6 w-6 text-blue-500" />
          <h3 className="text-2xl font-bold text-gray-100">O que são Metadados?</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <p className="text-lg text-gray-400 leading-relaxed">
              Metadados são "dados sobre dados". No contexto de uma fotografia digital, são informações invisíveis incorporadas ao arquivo da imagem que descrevem como, quando e onde a foto foi tirada.
            </p>
            <div className="space-y-4">
              <h4 className="font-bold text-gray-100">Principais tipos de metadados:</h4>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-500">EXIF:</span>
                  <span className="text-gray-400">Inclui configurações da câmera (ISO, abertura, velocidade do obturador), modelo do dispositivo e data/hora.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-500">GPS:</span>
                  <span className="text-gray-400">Coordenadas exatas de latitude e longitude de onde a foto foi capturada.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-500">IPTC/XMP:</span>
                  <span className="text-gray-400">Informações de direitos autorais, legendas, palavras-chave e histórico de edição.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-950 rounded-xl p-6 text-gray-300 font-mono text-sm space-y-2 overflow-hidden border border-gray-700">
            <p className="text-gray-500">// Exemplo de estrutura EXIF</p>
            <p><span className="text-blue-500">"Make"</span>: "Sony",</p>
            <p><span className="text-blue-500">"Model"</span>: "ILCE-7M4",</p>
            <p><span className="text-blue-500">"ExposureTime"</span>: 1/1000,</p>
            <p><span className="text-blue-500">"FNumber"</span>: 2.8,</p>
            <p><span className="text-blue-500">"ISO"</span>: 100,</p>
            <p><span className="text-blue-500">"DateTimeOriginal"</span>: "2024:04:14 12:30:45",</p>
            <p><span className="text-blue-500">"GPSLatitude"</span>: [-23, 33, 1.5],</p>
            <p><span className="text-blue-500">"GPSLongitude"</span>: [-46, 38, 2.1]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
