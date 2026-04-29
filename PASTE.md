Quiero que adaptes el frontend admin real de este proyecto para implementar correctamente el flujo encadenado de geo en formularios admin:

país -> provincia -> ciudad

Reglas de ejecución:
- Comunicación nula.
- No expliques nada.
- No des resúmenes.
- No listes cambios.
- No pidas confirmación.
- Usa make tree, make copy-paste FILES="..." y make create-empty FILES="..." si hace falta.
- Haz cambios completos y coherentes con la estructura existente.
- Al final ejecuta tests unitarios y e2e/integration si existen para este flujo.
- Cuando termines, responde únicamente: "he terminado".

Contexto real que debes respetar:
- Estamos trabajando en el admin.
- No me interesan endpoints públicos para este flujo.
- Los admins trabajan con ids.
- El frontend debe seguir el contrato real del backend admin.
- No inventes adaptadores legacy si no hacen falta.
- No hagas heurísticas de normalización de province.
- No hagas matching case-insensitive.
- No transformes province a lower/upper/capitalized.
- Province debe viajar exactamente con el valor seleccionado en el select.

Contrato backend admin a respetar

1) Países admin
- Endpoint: GET /admin/countries/all
- También existe GET /admin/countries paginado, pero para selects dependientes del admin aquí interesa el catálogo completo.
- Respuesta esperada:
  - data: CountryAdminResponse[] o CountryResponse[] mapeable a Country
- Cada país útil para el select:
  - id
  - name
- Para select:
  - value = country.id
  - label = country.name

2) Provincias admin
- Endpoint: GET /admin/countries/{country_id}/provinces
- Respuesta:
  - data: ProvinceAdminResponse[]
- No hay metadata
- No hay paginación
- Cada provincia trae:
  - name
  - active_city_count
  - inactive_city_count
- Province no tiene id
- Para select:
  - value = province.name
  - label = province.name
- Puede existir query param status, pero para formularios admin dependientes no quiero lógica rara.
- Si el formulario necesita que salgan todas las provincias existentes de ese país, usa el endpoint sin filtrar por status.
- No hacer corrección de casing.
- Si existe "Buenos Aires", se usa exactamente "Buenos Aires".
- Si el dato está mal escrito en base de datos, se verá así y luego se corregirá con PATCH en la ciudad correspondiente.

3) Ciudades admin
- Endpoint: GET /admin/countries/{country_id}/cities
- Query params soportados:
  - province
  - page
  - page_size
  - sort
  - status
- Respuesta:
  - data: CityResponse[]
  - metadata: ListResponseMetadata
- Cada ciudad admin útil para select:
  - id
  - country_id
  - country_name
  - name
  - slug
  - translation_key
  - region_name?
  - province_name?
  - latitude?
  - longitude?
  - is_active
- Para select:
  - value = city.id
  - label = city.name

Cómo debe funcionar el frontend admin

Objetivo:
- Primer select: país
- Segundo select: provincia
- Tercer select: ciudad

Flujo correcto:
1. Al entrar en el formulario admin que necesite esta dependencia:
   - cargar catálogo de países con GET /admin/countries/all
   - usar body.data

2. Cuando el admin seleccione un país:
   - guardar selectedCountryId
   - resetear provincia seleccionada
   - resetear ciudad seleccionada
   - vaciar opciones de provincias
   - vaciar opciones de ciudades
   - pedir provincias de ese país con:
     GET /admin/countries/{country_id}/provinces
   - usar body.data

3. Cuando el admin seleccione una provincia:
   - guardar selectedProvinceName exacto
   - resetear ciudad seleccionada
   - pedir ciudades de ese país y esa provincia con:
     GET /admin/countries/{country_id}/cities?province={province_name}&page=1&page_size=100&sort=slug_asc&status=all
   - usar body.data
   - consumir metadata solo para parsear bien la respuesta, no para la UX del select si no hace falta

4. Cuando no haya país:
   - select de provincia deshabilitado
   - select de ciudad deshabilitado

5. Cuando haya país pero no provincia:
   - select de provincia habilitado
   - select de ciudad deshabilitado

6. Cuando haya país y provincia:
   - select de ciudad habilitado y cargado desde el endpoint admin correspondiente

Qué debes corregir en el frontend actual
Revisa especialmente estos archivos y corrige el flujo entero:
- src/app/create/city/page.tsx
- src/app/cities/_components/CityForm.tsx
- src/_actions/city/getCities.ts
- src/_actions/city/getCitiesCatalogByCountryCode.ts
- src/_actions/country/getCountries.ts
- src/_actions/country/getAllCountries.ts
- src/_types/city.ts
- src/_types/country.ts
- src/_constants/apiRoutes.ts

Problemas que debes resolver sí o sí
- No usar endpoints públicos para este flujo admin.
- No depender de country code.
- No usar helpers legacy basados en country code.
- No asumir que provinces tiene metadata.
- No asumir que province tiene id.
- No tratar province como entidad persistida independiente.
- No hacer normalización case-insensitive de province.
- No pedir ciudades globales cuando el flujo depende de país y provincia.
- No dejar el form de city solo con country si ahora el flujo requiere provincia y ciudad en selects dependientes.
- No mantener APIs duplicadas ambiguas si puedes dejarlas claras y limpias.

Qué debes implementar
1. API routes claros en src/_constants/apiRoutes.ts para admin:
- ADMIN_COUNTRIES_ALL => /admin/countries/all
- ADMIN_COUNTRY_PROVINCES(countryId) => /admin/countries/${countryId}/provinces
- ADMIN_COUNTRY_CITIES(countryId) => /admin/countries/${countryId}/cities

Puedes mantener compatibilidad con nombres existentes si el repo lo necesita, pero deja el flujo claro y coherente.

2. Tipos frontend alineados al backend admin:
- Country select option basada en id + name
- Province admin response:
  - name
  - activeCityCount
  - inactiveCityCount
- Provinces admin list response:
  - data: ProvinceAdmin[]
- Cities admin list response:
  - data
  - metadata

3. Actions/server functions reutilizables:
- getAllCountries(): catálogo admin de países
- getAdminProvincesByCountryId(countryId)
- getAdminCitiesByCountryIdAndProvince(countryId, provinceName)

4. Integración real en el formulario admin correspondiente:
- cargar países
- al cambiar país cargar provincias
- al cambiar provincia cargar ciudades
- resetear correctamente estados dependientes
- mostrar selects con estados disabled/loading/empty coherentes

5. Si CityForm se usa tanto para create como edit:
- mantén compatibilidad con edición
- no rompas el edit actual
- pero deja el create admin correctamente guiado por selects dependientes
- si en edit hay datos existentes, precarga country/province/city cuando aplique sin romper la UX

Criterio técnico
- Backend-first
- Contratos explícitos
- Nada de heurísticas
- Nada de sobreingeniería
- Nada de country code en este flujo
- Province exacta, sin corregir casing
- Admin siempre con ids para entidades reales
- Province como string seleccionada y enviada tal cual

Al final:
- responde solo: "he terminado"