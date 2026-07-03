import type { IndicatorDefinition } from "@gelato/gelato-core";

export const WEB_INDICATOR_DEFINITIONS: Record<string, IndicatorDefinition> = {
  totalSolids: {
    title: "Sólidos totales",
    shortDescription: "Porcentaje de todo lo que no es agua: grasa, azúcares, sólidos lácteos, cacao, fibras, estabilizantes y otros sólidos.",
    whyItMatters: "Define cuerpo, cremosidad, rendimiento y resistencia en vitrina. Sólidos bajos producen gelato aguado y duro; sólidos altos pueden dar textura pesada, seca o pastosa.",
    correction: "Para subirlo agrega leche en polvo, cacao, fruta concentrada, inulina o reduce agua. Para bajarlo reduce ingredientes secos o aumenta parte líquida."
  },
  fat: {
    title: "Grasa",
    shortDescription: "Porcentaje de grasa aportada por leche, crema, cacao, frutos secos u otros ingredientes grasos.",
    whyItMatters: "Aporta cremosidad, redondea sabor y mejora la sensación en boca. Si está baja el helado queda frío y delgado; si está alta puede tapar sabores y sentirse pesado.",
    correction: "Sube con crema o ingredientes grasos; baja reemplazando parte de crema por leche o agua según el tipo de receta."
  },
  milkSolidsNonFat: {
    title: "Sólidos lácteos no grasos",
    shortDescription: "Proteínas, minerales y lactosa provenientes de leche, crema y leche en polvo, sin contar la grasa.",
    whyItMatters: "Mejoran cuerpo, emulsión y retención de aire. En exceso elevan lactosa y pueden generar textura arenosa durante almacenamiento.",
    correction: "Sube con leche en polvo descremada; baja reduciendo leche en polvo o sustituyendo parte de lácteos por agua o saborizantes."
  },
  totalSugars: {
    title: "Azúcares totales",
    shortDescription: "Suma de sacarosa, dextrosa, glucosa, fructosa y lactosa presentes en la mezcla.",
    whyItMatters: "Controlan dulzor, textura y punto de congelación. Pocos azúcares endurecen el gelato; demasiados lo dejan blando y empalagoso.",
    correction: "Ajusta sacarosa para dulzor, dextrosa para textura más blanda, jarabe de glucosa para cuerpo y menor dulzor relativo."
  },
  lactose: {
    title: "Lactosa",
    shortDescription: "Azúcar natural de la leche, crema y leche en polvo.",
    whyItMatters: "Ayuda al cálculo de sólidos, pero en exceso puede cristalizar y producir sensación arenosa.",
    correction: "Si está alta reduce leche en polvo o exceso de lácteos concentrados. Si está baja en gelato de leche, sube sólidos lácteos."
  },
  stabilizer: {
    title: "Neutro / estabilizante activo",
    shortDescription: "Porcentaje activo de gomas, fibras funcionales o estabilizantes que aportan control de agua y estructura.",
    whyItMatters: "Mejora cuerpo, resistencia en vitrina y control de cristales de hielo. Exceso genera textura gomosa o artificial.",
    correction: "Ajusta gramos del neutro o cambia la concentración de estabilizante activo en el neutro propio."
  },
  pac: {
    title: "PAC",
    shortDescription: "Poder anticongelante: indica cuánto bajan los azúcares el punto de congelación de la mezcla.",
    whyItMatters: "Determina dureza de servicio. PAC bajo da gelato duro; PAC alto da gelato blando o que se derrite rápido.",
    correction: "Sube con dextrosa o fructosa; baja reduciendo azúcares de alto PAC o usando más sacarosa/sólidos no dulces."
  },
  pod: {
    title: "POD",
    shortDescription: "Poder endulzante relativo de la mezcla, comparado principalmente contra la sacarosa.",
    whyItMatters: "Permite controlar dulzor sin depender solo de gramos de azúcar. POD alto empalaga; POD bajo deja sabor plano.",
    correction: "Sube con sacarosa o fructosa; baja reduciendo sacarosa/fructosa y compensando textura con dextrosa, glucosa o sólidos no dulces."
  },
  usage: {
    title: "Dosis por kg de mezcla",
    shortDescription: "Cantidad recomendada de neutro propio por cada kilo de mezcla.",
    whyItMatters: "Controla que el neutro sea funcional sin sobreestabilizar. Una dosis muy alta puede generar textura gomosa.",
    correction: "Ajusta el porcentaje de uso objetivo del neutro o cambia la concentración de estabilizantes activos."
  },
  carrier: {
    title: "Portador / sólidos de soporte",
    shortDescription: "Parte del neutro que sirve para distribuir estabilizantes y facilitar dosificación.",
    whyItMatters: "Un buen portador hace que el neutro sea fácil de pesar, mezclar y dispersar sin grumos.",
    correction: "Usa dextrosa, sacarosa, maltodextrina, inulina u otros sólidos neutros compatibles."
  },
  water: {
    title: "Humedad",
    shortDescription: "Agua presente en el ingrediente o neutro.",
    whyItMatters: "En neutros secos debe ser baja para evitar apelmazamiento y problemas de conservación.",
    correction: "Reduce componentes húmedos o usa materias primas secas."
  },
  emulsifier: {
    title: "Fase emulsificante grasa",
    shortDescription: "Fracción del neutro que ayuda a estabilizar grasa y aire, normalmente mono/diglicéridos u otros emulsificantes.",
    whyItMatters: "Ayuda a estructura y sensación cremosa, pero en exceso puede afectar sabor y textura.",
    correction: "Ajusta mono/diglicéridos o emulsificante según comportamiento real de la mezcla."
  }
};
