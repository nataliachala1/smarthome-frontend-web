import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../app/contexts/AuthContext';

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(i18n.language || 'es');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(25);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLangChange = (e) => {
    const l = e.target.value;
    setLang(l);
    i18n.changeLanguage(l);
    localStorage.setItem('i18nextLng', l);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a] dark:text-white">{t('settings.title') || 'Configuración'}</h1>
          <p className="text-sm text-[#666666] dark:text-[#a3a3a3] mt-1">{t('settings.description') || 'Ajustes de la cuenta y preferencias'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Apariencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Button variant={theme === 'light' ? 'primary' : 'outline'} onClick={() => handleThemeChange('light')}>Claro</Button>
                <Button variant={theme === 'dark' ? 'primary' : 'outline'} onClick={() => handleThemeChange('dark')}>Oscuro</Button>
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm">Idioma</label>
                <select value={lang} onChange={handleLangChange} className="w-64 px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#333333]">
                  <option value="es">ES Español</option>
                  <option value="en">EN English</option>
                  <option value="fr">FR Français</option>
                  <option value="de">DE Deutsch</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#fafafa] dark:bg-[#0f0f0f] border border-[#eee] p-4 rounded">Cambiar Contraseña<br/><span className="text-xs text-[#666]">Actualiza tu contraseña</span></div>
              <div className="bg-[#fafafa] dark:bg-[#0f0f0f] border border-[#eee] p-4 rounded">Autenticación de Dos Factores<br/><span className="text-xs text-[#666]">Aumenta la seguridad de tu cuenta</span></div>

              <div className="border border-[#fee2e2] bg-[#fff1f2] p-4 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[#991b1b]">Cerrar sesión</div>
                    <div className="text-xs text-[#991b1b]">En todos los dispositivos</div>
                  </div>
                  <Button variant="destructive" onClick={logout}>Cerrar Sesión</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-[#f0f0f0] rounded">
                <div>
                  <div className="font-medium">Notificaciones Push</div>
                  <div className="text-sm text-[#666666]">Recibe alertas en tiempo real</div>
                </div>
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={pushEnabled} onChange={() => setPushEnabled((v) => !v)} className="mr-2" />
                </label>
              </div>

              <div className="flex items-center justify-between p-3 border border-[#f0f0f0] rounded">
                <div>
                  <div className="font-medium">Notificaciones por Email</div>
                  <div className="text-sm text-[#666666]">Resúmenes diarios por email</div>
                </div>
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={emailEnabled} onChange={() => setEmailEnabled((v) => !v)} className="mr-2" />
                </label>
              </div>

              <div>
                <label className="block text-sm mb-2">Umbral de Alerta <span className="text-sm text-[#666]">{alertThreshold} kWh</span></label>
                <input type="range" min="5" max="100" value={alertThreshold} onChange={(e) => setAlertThreshold(Number(e.target.value))} className="w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#666666]">
              <div className="flex justify-between"><span>Versión</span><strong>1.0.0</strong></div>
              <div className="flex justify-between"><span>Última actualización</span><span>Mayo 2026</span></div>
              <div className="flex justify-between"><span>Soporte</span><a href="#" className="text-[#1866C1]">Contactar</a></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline">Cancelar</Button>
        <Button variant="primary">Guardar</Button>
      </div>
    </div>
  );
};
