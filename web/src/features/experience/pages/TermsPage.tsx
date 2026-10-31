import { Link } from 'react-router-dom';
import './TermsPage.css';

const contacts = [
  { name: 'Karen Daniela Holguín Cruz', email: 'klddaniela8@gmail.com' },
  { name: 'Natalia Chala Chala', email: 'nataliachala479@gmail.com' },
  { name: 'Kevin Stiven López Amaya', email: 'Kevinytkevinyt3@gmail.com' },
];

const sections = [
  { id: 'operador', title: '1. Quién opera Smart Home', summary: 'Identificamos al equipo del proyecto y los canales de contacto disponibles.', paragraphs: [
    'Smart Home es una plataforma web desarrollada como proyecto formativo de Análisis y Desarrollo de Software (ADSO), Ficha 3145555, en el contexto académico del SENA. El equipo del proyecto está conformado por Karen Daniela Holguín Cruz, Natalia Chala Chala y Kevin Stiven López Amaya.',
    'La referencia al SENA describe el contexto académico del proyecto. Por sí sola, no significa que la institución opere, administre, certifique o garantice el servicio.',
    'Puedes contactar al equipo en klddaniela8@gmail.com, nataliachala479@gmail.com o Kevinytkevinyt3@gmail.com.',
  ] },
  { id: 'servicio', title: '2. Para qué sirve el servicio', summary: 'Smart Home permite administrar hogares y supervisar dispositivos IoT compatibles.', paragraphs: [
    'Según las funciones habilitadas en cada versión, Smart Home permite crear y administrar hogares, invitar integrantes con distintos permisos, consultar estados de dispositivos IoT compatibles, enviar comandos de control, visualizar mediciones de potencia o consumo y recibir avisos asociados con la plataforma.',
    'Las funciones dependen de la versión, la compatibilidad y configuración del dispositivo, la red local, Internet y los servicios técnicos asociados. La mención de un modelo en la documentación no garantiza que se pueda vincular ni que todas sus funciones estén disponibles.',
  ] },
  { id: 'aceptacion', title: '3. Registro y aceptación', summary: 'Los términos deben estar disponibles antes de crear la cuenta.', paragraphs: [
    'Al registrarte, debes proporcionar información correcta y mantenerla actualizada. La aplicación solicita los datos necesarios para la cuenta, como nombre, correo electrónico y contraseña. No entregues información que no se solicite o cuya finalidad no haya sido informada.',
    'La aceptación de estos términos se recoge mediante una acción afirmativa en la aplicación. La autorización para tratar datos personales se informa de manera diferenciada cuando sea necesaria y se rige por la sección “Datos personales” y por la Política de Tratamiento de Datos Personales.',
  ] },
  { id: 'cuenta', title: '4. Cuenta y seguridad', summary: 'Cuida tus credenciales y comunícanos cualquier acceso que no reconozcas.', paragraphs: [
    'Mantén tu contraseña en reserva y evita compartirla. Si sospechas que otra persona accedió a tu cuenta, comunícalo cuanto antes a uno de los correos indicados al final de estos términos.',
    'Smart Home implementa controles de autenticación y autorización según la versión desplegada. Estos controles reducen riesgos, pero no aseguran que nunca se produzcan errores, accesos no autorizados o incidentes. La responsabilidad se analizará teniendo en cuenta las causas y la normativa aplicable.',
  ] },
  { id: 'hogares', title: '5. Hogares, invitaciones y permisos', summary: 'Lo que puedes consultar o controlar depende de tu rol en cada hogar.', paragraphs: [
    'Los hogares pueden tener propietarios y otros integrantes con roles como OWNER, MEMBER o GUEST, de acuerdo con las funciones habilitadas. El rol y las reglas aplicadas por la plataforma determinan las acciones disponibles; la apariencia de un botón no concede permisos por sí sola.',
    'Quien administra un hogar debe invitar solo a personas autorizadas. Los integrantes pueden consultar la información que permita su rol, incluidos determinados estados de dispositivos y mediciones. Al retirar una invitación o revocar un acceso, sus facultades pueden cambiar conforme a la implementación disponible.',
  ] },
  { id: 'dispositivos', title: '6. Dispositivos, comandos y conectividad', summary: 'Enviar un comando no confirma que el dispositivo físico lo haya ejecutado.', paragraphs: [
    'El funcionamiento depende de la energía, la red local, Internet, los servicios de comunicación asociados, la compatibilidad y la configuración del equipo. Puede haber demoras, interrupciones o diferencias entre el estado que muestra la aplicación y el estado físico.',
    'Asocia únicamente dispositivos sobre los que tengas autorización. No intentes acceder a equipos ajenos, evadir mecanismos de seguridad ni interferir con redes o servicios. Cuando una acción pueda tener consecuencias relevantes, verifica directamente el estado del dispositivo.',
  ] },
  { id: 'seguridad-electrica', title: '7. Seguridad eléctrica y uso responsable', summary: 'La plataforma no sustituye una instalación segura ni la supervisión humana.', paragraphs: [
    'La instalación, revisión y mantenimiento de relés, actuadores y equipos conectados a la red eléctrica deben estar a cargo de personal competente y realizarse conforme a los manuales y reglamentos aplicables. Una instalación inadecuada puede causar lesiones, incendios o daños materiales.',
    'No utilices Smart Home como único medio para controlar cargas críticas ni en situaciones en las que una falla pueda poner en riesgo a personas o bienes. La plataforma no es un servicio de emergencia, vigilancia, certificación eléctrica o aseguramiento de instalaciones.',
  ] },
  { id: 'mediciones', title: '8. Mediciones, alertas y reportes', summary: 'Los indicadores son informativos y pueden presentar demoras o imprecisiones.', paragraphs: [
    'Las mediciones y reportes dependen de los datos enviados por dispositivos y servicios asociados. Pueden cubrir solo las cargas monitoreadas y no necesariamente representan el consumo total del inmueble. Las estimaciones de costo en pesos colombianos, si se muestran, son orientativas y no sustituyen facturas, lecturas ni tarifas oficiales del prestador de energía.',
    'Las alertas y notificaciones pueden retrasarse o no llegar debido a fallas de red, configuración u otros servicios. No las uses como sistema de alarma o respuesta a emergencias.',
  ] },
  { id: 'uso-no-permitido', title: '9. Uso no permitido', summary: 'No uses la plataforma para acceder a información ajena o poner a alguien en riesgo.', paragraphs: [
    'No está permitido acceder a cuentas, hogares o dispositivos sin autorización; extraer, modificar o divulgar datos de otras personas sin permiso; manipular controles de seguridad; enviar comandos que puedan causar daños; interferir deliberadamente con el servicio; o utilizar Smart Home para actividades ilícitas.',
    'Si se presenta un uso indebido, el operador podrá limitar o suspender el acceso de forma proporcional y explicar la medida cuando sea posible. Se respetarán los derechos que la ley reconoce al usuario.',
  ] },
  { id: 'disponibilidad', title: '10. Disponibilidad y cambios técnicos', summary: 'El servicio puede tener interrupciones o cambiar mientras evoluciona el proyecto.', paragraphs: [
    'Smart Home puede presentar mantenimientos, errores, interrupciones o indisponibilidad temporal. El equipo procurará informar sobre interrupciones o cambios relevantes por los medios disponibles cuando sea razonable hacerlo. No se promete disponibilidad continua si no existe un compromiso técnico y contractual que la respalde.',
  ] },
  { id: 'pagos', title: '11. Precio, pagos, envíos y devoluciones', summary: 'El documento del proyecto no describe ventas, cobros ni envíos desde Smart Home.', paragraphs: [
    'La versión de Smart Home descrita en el documento del proyecto no contempla compras de productos, pagos, suscripciones ni envíos desde la plataforma. Por ello, estos términos no establecen precios, métodos de pago o devoluciones de compras.',
    'Si se habilitan planes pagos, suscripciones o ventas, se actualizarán las condiciones antes de ofrecerlos. Se informará previamente el precio total, impuestos, forma y periodicidad del cobro, renovación, cancelación, entrega, garantías y derechos de retracto o devolución que correspondan.',
  ] },
  { id: 'cierre-cuenta', title: '12. Desactivación y cierre de cuenta', summary: 'Desactivar una cuenta no siempre elimina de inmediato los registros compartidos.', paragraphs: [
    'Puedes solicitar la desactivación mediante los controles disponibles en la aplicación o escribiendo a los canales de contacto. La desactivación puede afectar el acceso y los permisos, pero no implica por sí sola que todos los registros se eliminen de inmediato.',
    'Ciertos registros pueden conservarse durante el tiempo necesario para gestionar hogares compartidos, atender solicitudes, proteger derechos o cumplir obligaciones legales. Las solicitudes de supresión o revocación se tramitarán según la ley y la Política de Tratamiento de Datos Personales.',
  ] },
  { id: 'datos-personales', title: '13. Datos personales', summary: 'Puedes solicitar acceso, actualización, corrección o supresión de tus datos.', paragraphs: [
    'Smart Home trata datos de cuenta, como nombre y correo electrónico, e información relacionada con hogares, integrantes, permisos, dispositivos y telemetría, en la medida necesaria para operar las funciones habilitadas, gestionar accesos, ofrecer soporte y proteger la plataforma.',
    'El tratamiento de datos personales se rige por la Política de Tratamiento de Datos Personales de Smart Home. La política debe estar disponible junto a estos términos y detallar las finalidades, los plazos de conservación, los proveedores que intervienen, los países de almacenamiento cuando aplique y el procedimiento para ejercer los derechos del titular.',
    'Puedes solicitar el acceso, actualización, corrección o supresión de tus datos, revocar una autorización cuando proceda y presentar reclamos a través de cualquiera de los correos de contacto publicados en esta página. La atención se realizará conforme a los plazos y excepciones establecidos por la ley colombiana.',
    'La plataforma puede utilizar controles de autenticación, autorización y aislamiento de datos. Estos controles dependen de su configuración y mantenimiento; no constituyen una garantía absoluta de seguridad o aislamiento.',
  ] },
  { id: 'propiedad-intelectual', title: '14. Propiedad intelectual', summary: 'El acceso a Smart Home no transfiere derechos sobre el software ni sus marcas.', paragraphs: [
    'El software, los textos, diseños y signos distintivos de Smart Home pertenecen a sus titulares o se utilizan bajo licencia. Puedes utilizar la plataforma para sus funciones y conforme a estos términos. No puedes copiar, revender, distribuir, modificar o descompilar sus componentes salvo que la ley o la licencia aplicable lo permita.',
    'Los componentes de terceros se rigen por sus propias licencias. El uso de nombres, logotipos o materiales institucionales no implica respaldo institucional.',
  ] },
  { id: 'suspension', title: '15. Limitación o suspensión del acceso', summary: 'El acceso podrá limitarse ante riesgos de seguridad o incumplimientos graves.', paragraphs: [
    'El operador podrá adoptar medidas razonables para proteger cuentas, hogares, dispositivos y el servicio ante accesos no autorizados, incumplimientos de estos términos o riesgos técnicos. Cuando sea posible, informará el motivo y los pasos para solicitar revisión. Las medidas serán proporcionales y no limitarán derechos irrenunciables.',
  ] },
  { id: 'responsabilidad', title: '16. Responsabilidad y garantías', summary: 'La plataforma depende también de dispositivos y redes que pueden fallar.', paragraphs: [
    'Smart Home puede presentar errores de software, desconexiones, datos incompletos o diferencias entre el comando enviado y la respuesta física. Su uso no reemplaza la verificación directa cuando una acción pueda tener consecuencias relevantes.',
    'Estos términos no excluyen derechos irrenunciables, obligaciones legales de seguridad ni responsabilidades que no puedan limitarse por ley. La responsabilidad por un incidente se determinará según sus circunstancias y la normativa aplicable. La relación académica del proyecto no convierte por sí sola al SENA en operador o garante del servicio.',
  ] },
  { id: 'cambios', title: '17. Modificaciones de los términos', summary: 'Las nuevas versiones indicarán su fecha y se comunicarán si el cambio es relevante.', paragraphs: [
    'Los términos podrán actualizarse para reflejar cambios legales, técnicos o funcionales. Cada versión indicará su fecha. Los cambios sustanciales se comunicarán mediante la aplicación o el correo registrado y se solicitará una nueva aceptación cuando sea necesario.',
  ] },
  { id: 'ley-contacto', title: '18. Ley aplicable y contacto', summary: 'Se aplica la normativa colombiana, sin renunciar a derechos reconocidos por la ley.', paragraphs: [
    'Estos términos se rigen por la legislación colombiana. Las diferencias se atenderán ante las autoridades o jueces competentes conforme a las reglas aplicables.',
    'Para soporte, solicitudes sobre tu cuenta o consultas relacionadas con datos personales, puedes escribir al equipo de Smart Home:',
  ], contacts: true },
];

export const TermsPage = () => (
  <main className="sh-legal-page sh-page-enter">
    <div className="sh-legal-shell">
      <header className="sh-legal-header">
        <Link className="sh-legal-brand" to="/login" aria-label="Smart Home, ir a inicio de sesión">
          <span>Smart <strong>Home</strong></span>
        </Link>
        <nav className="sh-legal-header__actions" aria-label="Navegación de cuenta">
          <Link to="/login">Iniciar sesión</Link>
          <Link className="sh-legal-header__register" to="/register">Crear cuenta</Link>
        </nav>
      </header>

      <section className="sh-legal-intro" aria-labelledby="sh-legal-title">
        <p className="sh-legal-eyebrow">DOCUMENTO LEGAL</p>
        <h1 id="sh-legal-title">Términos y condiciones</h1>
        <p className="sh-legal-intro__copy">Estas condiciones explican cómo usar Smart Home, qué esperar de los dispositivos conectados y cómo contactar al equipo.</p>
        <div className="sh-legal-meta">
          <span>Smart Home · Proyecto formativo ADSO</span>
          <span>Actualizado el 31 de octubre de 2026</span>
        </div>
      </section>

      <section className="sh-legal-summary" aria-labelledby="sh-legal-summary-title">
        <div>
          <p className="sh-legal-eyebrow">ANTES DE CONTINUAR</p>
          <h2 id="sh-legal-summary-title">Lo esencial</h2>
        </div>
        <div className="sh-legal-summary__items">
          <a href="#pagos"><strong>Sin compras en la versión descrita</strong><span>El proyecto no contempla cobros ni envíos desde la plataforma.</span></a>
          <a href="#hogares"><strong>Accesos por hogar</strong><span>Los integrantes ven y controlan según sus permisos.</span></a>
          <a href="#dispositivos"><strong>Verifica los dispositivos</strong><span>Un comando enviado no confirma su ejecución física.</span></a>
          <a href="#datos-personales"><strong>Tus datos</strong><span>Consulta cómo ejercer tus derechos y contactar al equipo.</span></a>
        </div>
      </section>

      <div className="sh-legal-layout">
        <details className="sh-legal-mobile-index">
          <summary>Índice de secciones</summary>
          <nav aria-label="Índice de términos y condiciones">
            {sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
          </nav>
        </details>

        <aside className="sh-legal-toc" aria-label="Índice de términos y condiciones">
          <p>EN ESTE DOCUMENTO</p>
          <nav>
            {sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
          </nav>
        </aside>

        <article className="sh-legal-document" aria-label="Texto completo de los términos y condiciones">
          {sections.map((section) => (
            <section className="sh-legal-section" id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              <p className="sh-legal-section__summary">{section.summary}</p>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.contacts && (
                <ul className="sh-legal-contacts">
                  {contacts.map((contact) => (
                    <li key={contact.email}><span>{contact.name}</span><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <footer className="sh-legal-footer">
            <span>Smart Home · Términos y condiciones · Versión 2.1</span>
            <Link to="/register">Volver al registro</Link>
          </footer>
        </article>
      </div>

      <p className="sh-legal-note">La Política de Tratamiento de Datos Personales es un documento independiente y debe publicarse junto con estos términos.</p>
    </div>
  </main>
);
