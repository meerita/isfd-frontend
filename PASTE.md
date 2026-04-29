Quiero corregir `surface_type` en el frontend del módulo `stadiums` para alinearlo con el nuevo contrato backend en uppercase.

Objetivo:
- dejar de usar valores lowercase en frontend
- usar exclusivamente estos valores:
  - NATURAL_GRASS
  - ARTIFICIAL_TURF
  - HYBRID
  - CLAY
  - SAND
  - CONCRETE
  - OTHER
- mantener `surface_type` como `select` en create y edit
- no romper el patrón ya implementado de stadiums

Reglas:
- habla en castellano, código en inglés
- no hagas resúmenes
- no hables de más
- al terminar responde solo: "he terminado"
- en este frontend no hacemos tests
- devuelve el código completo de todos los archivos que cambies
- no metas refactors extra ni cambios cosméticos innecesarios
- sigue el patrón existente de `countries`, `clubs`, `federations` y `stadiums`
- usa comandos `copy-paste` y `create-empty` si necesitas más contexto, igual que hacemos en backend

Contrato final obligatorio de `surface_type`:
- NATURAL_GRASS
- ARTIFICIAL_TURF
- HYBRID
- CLAY
- SAND
- CONCRETE
- OTHER

Contexto importante:
- el backend ya no debe trabajar con lowercase
- el select debe mostrar esos mismos valores tal cual, sin traducciones
- no quiero labels separados ni prettified labels por ahora
- create y edit deben enviar exactamente esos strings uppercase
- si el backend devuelve uno de esos valores, el form debe poder renderizarlo y mantenerlo seleccionado

Archivos frontend ya identificados:
- `src/_types/stadium.ts`
- `src/_actions/stadium/mappers.ts`
- `src/_actions/stadium/payload.ts`
- `src/app/stadiums/_components/StadiumForm.tsx`
- `src/_constants/stadiumErrorMessages.ts`

El formulario en de Stadiums, en modo creación no usa Select, tiene un Input, el de edit está perfecto: ajusta para que ambos usen Select con los mismos valores uppercase.

Antes de tocar nada:
1. revisa si estos archivos alcanzan
2. si necesitas más contexto, pídelo con `make copy-paste FILES="..."`

Cambios que espero:

1. `src/_types/stadium.ts`
- cambia `STADIUM_SURFACE_TYPES` a:
  - `NATURAL_GRASS`
  - `ARTIFICIAL_TURF`
  - `HYBRID`
  - `CLAY`
  - `SAND`
  - `CONCRETE`
  - `OTHER`
- ajusta `StadiumSurfaceType` para que derive de esos valores uppercase

2. `src/_actions/stadium/payload.ts`
- `optionalSurfaceType` debe validar únicamente uppercase
- cualquier validación de `surface_type` debe trabajar con uppercase
- `buildCreateStadiumBody` debe enviar uppercase
- `buildUpdateStadiumBody` debe enviar uppercase
- no metas compatibilidad silenciosa con lowercase
- mantén el patrón actual del archivo

3. `src/app/stadiums/_components/StadiumForm.tsx`
- conserva `surfaceType` como `Select`
- el select debe listar exactamente:
  - NATURAL_GRASS
  - ARTIFICIAL_TURF
  - HYBRID
  - CLAY
  - SAND
  - CONCRETE
  - OTHER
- sin traducciones
- sin labels bonitos
- create y edit deben seguir funcionando
- el valor inicial en edit debe seguir apareciendo seleccionado si viene del backend

4. `src/_actions/stadium/mappers.ts`
- revisa si hace falta tipar mejor `surfaceType`
- si hace falta, haz que el mapper devuelva `StadiumSurfaceType | null` de forma coherente
- no sobreingenierices
- no metas helpers innecesarios si no aportan valor real

5. `src/_constants/stadiumErrorMessages.ts`
- revisa si hay que tocar algo
- solo cambia algo si realmente hace falta
- no inventes mensajes nuevos salvo necesidad real

Criterios de aceptación:
- no queda ningún valor lowercase de `surface_type` en el frontend de stadiums
- el select de create usa uppercase
- el select de edit usa uppercase
- el payload enviado al backend usa uppercase
- el tipo TS usa uppercase
- no rompes navegación ni flujo de create/update
- no haces refactors fuera del alcance

Entrega:
- devuelve los archivos completos modificados
- sin resumen
- y termina exactamente con: `he terminado`