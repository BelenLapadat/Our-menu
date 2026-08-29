import LegalPage from "@/app/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Politica de privacidad">
      <p>
        Esta pagina explica que datos recopila Nuestro Menusito y como se usan.
      </p>
      <section>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Datos que recopilamos
        </h2>
        <p className="mt-2">
          Si inicias sesion con Google, guardamos tu nombre, correo electronico,
          foto de perfil e identificador de Google. Tambien almacenamos las
          recetas, menus, comidas planificadas e invitaciones de hogar que
          crees en la aplicacion.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Como usamos tus datos
        </h2>
        <p className="mt-2">
          Usamos esta informacion solo para hacer funcionar la aplicacion:
          autenticarte, mostrar tu contenido y permitir la colaboracion dentro
          de tu hogar. No vendemos ni compartimos tus datos con terceros con
          fines publicitarios.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Servicios de terceros
        </h2>
        <p className="mt-2">
          Google procesa tu inicio de sesion segun sus propias politicas. Los
          datos de la aplicacion se almacenan en una base de datos alojada en
          la nube (Turso).
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
          Contacto
        </h2>
        <p className="mt-2">
          Si tienes preguntas sobre esta politica, puedes{" "}
          <a
            href="mailto:belenlapadat@gmail.com"
            className="font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            escribirnos
          </a>
          .
        </p>
      </section>
      <p>Ultima actualizacion: agosto de 2026.</p>
    </LegalPage>
  );
}
