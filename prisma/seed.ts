import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import pkg from "pg"
import "dotenv/config"

const { Pool } = pkg

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🌱 Seeding database...")

    // Hash password
    const seedPassword = process.env.SEED_PASSWORD
    if (!seedPassword) {
        throw new Error("❌ ERROR: La variable de entorno 'SEED_PASSWORD' es requerida para el seeding.")
    }
    const passwordHash = await bcrypt.hash(seedPassword!, 10)

    // Create institution user
    const institution = await prisma.user.upsert({
        where: { email: "prensa@minedu.gob.pe" },
        update: {},
        create: {
            email: "prensa@minedu.gob.pe",
            name: "Ministerio de Educación Nacional",
            passwordHash,
            role: "INSTITUTION",
            description: "Entidad rectora de las políticas educativas nacionales, comprometida con garantizar una educación de calidad, inclusiva y equitativa para todos los peruanos.",
            website: "https://www.gob.pe/minedu",
            logo: "https://ui-avatars.com/api/?name=Ministerio+Educacion&size=256&background=1e3a8a&color=fff&bold=true&format=png",
            abbreviation: "MINEDU",
            slug: "minedu"
        },
    })

    console.log("✅ Institution created:", institution.email)

    // Create categories
    const categoryNames = [
        "Política",
        "Economía",
        "Salud",
        "Educación",
        "Seguridad",
        "Cultura",
        "Deportes",
        "Tecnología",
        "Medio Ambiente",
        "Infraestructura",
    ]

    const categories: { [key: string]: string } = {}

    for (const name of categoryNames) {
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")

        const category = await prisma.category.upsert({
            where: { slug },
            update: {},
            create: { name, slug },
        })

        categories[name] = category.id
    }

    console.log(`✅ Created ${categoryNames.length} categories`)

    // Sample press notes
    const pressNotes = [
        {
            title: "Ministerio de Educación anuncia nuevo programa de becas para estudiantes destacados",
            slug: "programa-becas-estudiantes-2024-" + Date.now(),
            summary: "El programa beneficiará a más de 5,000 estudiantes de todo el país con becas integrales para educación superior.",
            content: `El Ministerio de Educación Nacional ha presentado hoy un ambicioso programa de becas que beneficiará a estudiantes de alto rendimiento académico provenientes de familias de bajos recursos.

El programa "Beca Excelencia 2024" contempla el financiamiento completo de estudios universitarios, incluyendo matrícula, materiales de estudio, alojamiento y una asignación mensual para gastos de manutención.

Los requisitos para postular incluyen un promedio mínimo de 16 puntos en educación secundaria, situación socioeconómica vulnerable verificada y aprobar un examen de aptitud académica.

Las inscripciones estarán abiertas desde el 15 de enero hasta el 28 de febrero del próximo año a través del portal oficial del ministerio.`,
            mainImage: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80",
            published: true,
            categoryIds: [categories["Educación"]],
        },
        {
            title: "Inauguración de 50 nuevas aulas digitales en zonas rurales del país",
            slug: "aulas-digitales-zonas-rurales-" + Date.now(),
            summary: "La iniciativa busca reducir la brecha digital y mejorar la calidad educativa en comunidades alejadas.",
            content: `En una ceremonia oficial realizada en la región de Ayacucho, el Ministerio de Educación inauguró las primeras 50 aulas digitales de un proyecto que contempla la implementación de 500 espacios tecnológicos en zonas rurales.

Cada aula cuenta con 30 computadoras de última generación, conexión a internet satelital, pizarras digitales interactivas y material educativo multimedia.

El proyecto, con una inversión de 150 millones de soles, busca garantizar que los estudiantes de zonas alejadas tengan acceso a las mismas herramientas tecnológicas que sus pares en áreas urbanas.

Los docentes recibirán capacitación especializada en el uso de estas tecnologías para maximizar su impacto en el aprendizaje.`,
            mainImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80",
            published: true,
            categoryIds: [categories["Educación"], categories["Tecnología"], categories["Infraestructura"]],
        },
        {
            title: "Resultados positivos en evaluación nacional de comprensión lectora",
            slug: "resultados-evaluacion-lectora-" + Date.now(),
            summary: "Los estudiantes peruanos muestran una mejora del 12% en comprensión lectora según la última evaluación censal.",
            content: `Los resultados de la Evaluación Censal de Estudiantes (ECE) 2024 revelan avances significativos en comprensión lectora, con un incremento del 12% respecto al año anterior.

El 68% de los estudiantes de segundo grado de primaria alcanzaron el nivel satisfactorio en lectura, superando la meta establecida para este año.

Estos resultados son fruto de la implementación del programa "Todos Leemos", que ha distribuido más de 2 millones de libros en escuelas públicas y ha capacitado a 80,000 docentes en metodologías de enseñanza de la lectura.

El ministerio anunció que se mantendrá el énfasis en comprensión lectora para los próximos años, con nuevas estrategias enfocadas en la lectura digital y el pensamiento crítico.`,
            mainImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
            published: true,
            categoryIds: [categories["Educación"]],
        },
        {
            title: "Alianza estratégica con universidades para formación docente de excelencia",
            slug: "alianza-formacion-docente-" + Date.now(),
            summary: "Convenio con 15 universidades líderes fortalecerá la calidad de la formación inicial de maestros.",
            content: `El Ministerio de Educación firmó hoy convenios con 15 universidades de prestigio nacional e internacional para elevar los estándares de formación docente en el país.

La alianza incluye el diseño de nuevas mallas curriculares basadas en evidencia internacional, programas de intercambio para futuros docentes y el establecimiento de centros de práctica pedagógica equipados con tecnología de punta.

Se estima que estos acuerdos beneficiarán a más de 30,000 estudiantes de pedagogía en los próximos cinco años.

Además, se implementarán programas de acompañamiento para docentes nóveles durante sus primeros tres años de ejercicio profesional, garantizando una transición efectiva de la universidad al aula.`,
            mainImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
            published: true,
            categoryIds: [categories["Educación"]],
        },
        {
            title: "Lanzamiento del programa nacional de educación ambiental",
            slug: "programa-educacion-ambiental-" + Date.now(),
            summary: "Nueva iniciativa integrará la sostenibilidad y el cuidado del medio ambiente en el currículo escolar.",
            content: `El Ministerio de Educación presentó el Programa Nacional de Educación Ambiental "Escuelas Verdes", que se implementará en todas las instituciones educativas públicas del país.

El programa contempla la integración transversal de contenidos ambientales en todas las áreas curriculares, la creación de brigadas ecológicas estudiantiles y la implementación de proyectos de reciclaje y huertos escolares.

Se destinarán 80 millones de soles para equipar las escuelas con infraestructura verde, incluyendo sistemas de captación de agua de lluvia, paneles solares y puntos de reciclaje.

La meta es formar una nueva generación de ciudadanos conscientes de su responsabilidad con el planeta y comprometidos con el desarrollo sostenible.`,
            mainImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
            published: true,
            categoryIds: [categories["Educación"], categories["Medio Ambiente"]],
        },
        {
            title: "Modernización de infraestructura educativa: 200 escuelas renovadas en 2024",
            slug: "modernizacion-infraestructura-escuelas-" + Date.now(),
            summary: "Inversión histórica en infraestructura educativa beneficia a más de 80,000 estudiantes en todo el país.",
            content: `El Ministerio de Educación culminó la renovación de 200 instituciones educativas a nivel nacional, marcando un hito en la modernización de la infraestructura escolar del país.

Las intervenciones incluyeron la reconstrucción de aulas, implementación de laboratorios de ciencias, bibliotecas modernas, canchas deportivas y servicios higiénicos dignos.

Con una inversión total de 450 millones de soles, este programa ha beneficiado directamente a 80,000 estudiantes y ha generado más de 5,000 empleos temporales en las comunidades.

Para el 2025, se tiene previsto intervenir 300 instituciones educativas adicionales, priorizando las escuelas ubicadas en zonas de mayor vulnerabilidad y alejadas de centros urbanos.`,
            mainImage: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
            published: true,
            categoryIds: [categories["Educación"], categories["Infraestructura"]],
        },
    ]

    // Create press notes
    for (const note of pressNotes) {
        await prisma.pressNote.create({
            data: {
                ...note,
                authorId: institution.id,
            },
        })
    }

    console.log(`✅ Created ${pressNotes.length} press notes`)
    console.log("\n🎉 Seeding completed successfully!")
    console.log("\nLogin credentials:")
    console.log("  Email: prensa@minedu.gob.pe")
    console.log("  Password: (ver variable SEED_PASSWORD)")
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
