import LegalPage from "@/app/components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Terminos de uso">
      <p>
        Nuestro Menusito es una aplicacion personal para planificar comidas,
        guardar recetas y compartir un calendario con tu hogar.
      </p>
      <p>
        Al usar la aplicacion aceptas utilizarla de forma responsable y solo
        para fines personales o familiares. Eres responsable del contenido que
        creas (recetas, notas y comidas planificadas).
      </p>
      <p>
        El servicio se ofrece tal cual, sin garantias de disponibilidad
        continua. Podemos actualizar o interrumpir funciones cuando sea
        necesario.
      </p>
      <p>
        Para acceder necesitas iniciar sesion con Google. No compartas tu
        cuenta con personas fuera de tu hogar invitado.
      </p>
      <p>Ultima actualizacion: agosto de 2026.</p>
    </LegalPage>
  );
}
