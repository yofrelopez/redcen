// ==============================================================================
// 🏛️ REGISTRO MAESTRO DE INSTITUCIONES (REDCEN)
// ==============================================================================
// Este archivo es la ÚNICA fuente de verdad para agregar, editar o quitar instituciones.
//
// ⚠️ INSTRUCCIONES:
// 1. Para AGREGAR: Añade un nuevo objeto al final de la lista.
// 2. Para EDITAR: Modifica los campos que necesites.
// 3. Para ELIMINAR: Simplemente borra el bloque de la institución de este archivo.
//    (El script de sincronización desactivará automáticamente las que ya no estén aquí)
//
// ⚠️ NO TOCAR CÓDIGO, SOLO DATOS.
// ==============================================================================

export interface Institution {
    name: string
    abbreviation: string
    slug: string
    email: string
    facebookUrl: string
    region: string
    province: string
    district: string
    scrapeHour: number // 6 = Mañana, 12 = Mediodía, 18 = Tarde
}

export const INSTITUTIONS_REGISTRY: Institution[] = [
    // --- TURNO 6:00 AM (Mañana) ---
    {
        name: "Municipalidad Provincial de Barranca",
        abbreviation: "MPB",
        slug: "mpb",
        email: "prensa@munibarranca.gob.pe",
        facebookUrl: "https://www.facebook.com/MunicipalidadDeBarranca",
        region: "Lima",
        province: "Barranca",
        district: "Barranca",
        scrapeHour: 6
    },
    {
        name: "Gobierno Regional de Lima",
        abbreviation: "GORELI",
        slug: "goreli",
        email: "prensa@regionlima.gob.pe",
        facebookUrl: "https://www.facebook.com/GobiernoRegionalLima",
        region: "Lima",
        province: "Lima",
        district: "Lima",
        scrapeHour: 6
    },
    {
        name: "Municipalidad Provincial de Huaura",
        abbreviation: "MPH",
        slug: "mph",
        email: "prensa@munihuaura.gob.pe",
        facebookUrl: "https://www.facebook.com/MuniProvHuaura",
        region: "Lima",
        province: "Huaura",
        district: "Huacho",
        scrapeHour: 6
    },

    // --- TURNO 12:00 PM (Mediodía) ---
    {
        name: "Municipalidad Distrital De Paramonga",
        abbreviation: "MDP",
        slug: "mdp",
        email: "prensa@muniparamonga.gob.pe",
        facebookUrl: "https://www.facebook.com/muniparamongaoficial",
        region: "Lima",
        province: "Barranca",
        district: "Paramonga",
        scrapeHour: 12
    },
    {
        name: "Municipalidad Distrital de Pativilca",
        abbreviation: "MDPA",
        slug: "mdpa",
        email: "prensa@munipativilca.gob.pe",
        facebookUrl: "https://www.facebook.com/MunicipalidadDePativilca",
        region: "Lima",
        province: "Barranca",
        district: "Pativilca",
        scrapeHour: 12
    },
    {
        name: "Corte Superior de Justicia de Huaura",
        abbreviation: "CSJH",
        slug: "csjh",
        email: "prensa@csjhuaura.gob.pe",
        facebookUrl: "https://www.facebook.com/CorteSuperiorDeJusticiaDeHuaura",
        region: "Lima",
        province: "Huaura",
        district: "Huacho",
        scrapeHour: 12
    },

    // --- TURNO 6:00 PM (Tarde) ---
    {
        name: "Universidad Nacional de Barranca",
        abbreviation: "UNAB",
        slug: "unab",
        email: "prensa@unab.gob.pe",
        facebookUrl: "https://www.facebook.com/UNABOFICIAL",
        region: "Lima",
        province: "Barranca",
        district: "Barranca",
        scrapeHour: 18
    },
    {
        name: "Municipalidad Provincial De Huaral",
        abbreviation: "MPHAL",
        slug: "mphal",
        email: "prensa@muniprovhuaral.gob.pe",
        facebookUrl: "https://www.facebook.com/muniprovhuaral",
        region: "Lima",
        province: "Huaura",
        district: "Huaral",
        scrapeHour: 18
    },
    {
        name: "Municipalidad Distrital de Chancay",
        abbreviation: "MDCH",
        slug: "mdch",
        email: "prensa@munichancay.gob.pe",
        facebookUrl: "https://www.facebook.com/munichancay",
        region: "Lima",
        province: "Huaura",
        district: "Chancay",
        scrapeHour: 18
    }
]
