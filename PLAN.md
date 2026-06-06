# 🏆 Medellín Handball Cup — Plan de Proyecto

## Descripción
Plataforma web para la gestión del torneo universitario de balonmano **Medellín Handball Cup**.
Permite a un organizador llenar planillas digitales desde el celular y publica automáticamente
resultados, tabla de posiciones y estadísticas en una página pública.

---

## 🎯 Alcance

- **Usuarios:** 10–20 equipos, un organizador por torneo
- **Quién llena planillas:** el organizador desde la mesa (móvil)
- **Qué ve el público:** fixture, tabla de posiciones, goleadores, tarjetas
- **Alcance:** un solo torneo (sin multitenant por ahora)

---

## 🏗️ Arquitectura General

```
hublecop/
├── backend/          # API REST en Flask (Python)
├── frontend/         # SPA en React + Tailwind (móvil-first)
└── docs/             # Decisiones de arquitectura, diagramas
```

### Separación de responsabilidades
- El **backend** expone una API REST pura (JSON). No renderiza HTML.
- El **frontend** consume la API. Tiene dos secciones:
  - `/admin` — panel privado para el organizador (requiere login)
  - `/` — página pública de resultados (sin login)
- La **base de datos** es PostgreSQL (Supabase en producción, SQLite local para desarrollo rápido).

---

## 🗃️ Modelo de Datos

```
Equipo
  id              UUID PK
  nombre          VARCHAR(100)
  logo_url        VARCHAR(255)   nullable
  created_at      TIMESTAMP

Jugador
  id              UUID PK
  nombre          VARCHAR(100)
  numero_camiseta INT
  equipo_id       UUID FK → Equipo
  activo          BOOLEAN DEFAULT true

Partido
  id              UUID PK
  equipo_local_id    UUID FK → Equipo
  equipo_visitante_id UUID FK → Equipo
  fecha           TIMESTAMP
  estado          ENUM(PROGRAMADO, EN_CURSO, FINALIZADO)
  goles_local     INT DEFAULT 0
  goles_visitante INT DEFAULT 0
  fase            VARCHAR(50)    # "Fase de grupos", "Semifinal", etc.
  created_at      TIMESTAMP

Evento
  id              UUID PK
  partido_id      UUID FK → Partido
  jugador_id      UUID FK → Jugador   nullable (gol en propia puerta sin jugador)
  equipo_id       UUID FK → Equipo    # a qué equipo se le cuenta el evento
  tipo            ENUM(GOL, TARJETA_AMARILLA, TARJETA_ROJA, TIEMPO_FUERA)
  minuto          INT
  created_at      TIMESTAMP
```

### Reglas de negocio
- Un partido no puede tener dos equipos iguales.
- Solo se pueden registrar eventos en partidos con estado `EN_CURSO`.
- `goles_local` y `goles_visitante` se recalculan automáticamente al agregar/eliminar un evento `GOL`.
- Una tarjeta roja directa no requiere dos amarillas previas (se registran independiente).

---

## 🛠️ Stack Tecnológico

| Capa            | Tecnología              | Justificación                              |
|-----------------|-------------------------|--------------------------------------------|
| Backend API     | Python 3.12 + Flask     | Ya conocido del proyecto Bite-Now          |
| ORM             | SQLAlchemy 2.x          | Estándar Flask, migraciones con Alembic    |
| Auth            | Flask-JWT-Extended      | Ya conocido, simple para un solo rol       |
| Base de datos   | PostgreSQL (Supabase)   | Gratis, confiable, SQL estándar            |
| Dev DB          | SQLite                  | Sin configuración para desarrollo local    |
| Frontend        | React 18 + Vite         | Rápido, ecosistema moderno                 |
| Estilos         | Tailwind CSS            | Móvil-first, utility-first                 |
| HTTP client     | Axios                   | Manejo de errores e interceptores fácil    |
| Deploy backend  | Render (free tier)      | Conecta directo con GitHub                 |
| Deploy frontend | Vercel (free tier)      | Ideal para React/Vite                      |

---

## 📁 Estructura de Carpetas

### Backend (`/backend`)
```
backend/
├── app/
│   ├── __init__.py           # Factory function create_app()
│   ├── extensions.py         # db, jwt, migrate (instancias únicas)
│   ├── config.py             # Config por entorno (dev, prod)
│   │
│   ├── models/               # Modelos SQLAlchemy (1 archivo por modelo)
│   │   ├── __init__.py
│   │   ├── equipo.py
│   │   ├── jugador.py
│   │   ├── partido.py
│   │   └── evento.py
│   │
│   ├── schemas/              # Marshmallow schemas para serialización
│   │   ├── __init__.py
│   │   ├── equipo_schema.py
│   │   ├── jugador_schema.py
│   │   ├── partido_schema.py
│   │   └── evento_schema.py
│   │
│   ├── routes/               # Blueprints (1 por recurso)
│   │   ├── __init__.py
│   │   ├── auth_routes.py    # POST /api/auth/login
│   │   ├── equipo_routes.py  # CRUD /api/equipos
│   │   ├── jugador_routes.py # CRUD /api/jugadores
│   │   ├── partido_routes.py # CRUD /api/partidos
│   │   └── evento_routes.py  # CRUD /api/eventos
│   │
│   └── services/             # Lógica de negocio (separada de las rutas)
│       ├── __init__.py
│       ├── partido_service.py   # calcular goles, cambiar estado
│       └── estadisticas_service.py  # tabla posiciones, goleadores
│
├── migrations/               # Alembic migrations
├── tests/                    # Pruebas unitarias
├── .env.example              # Variables de entorno de ejemplo
├── requirements.txt
└── run.py                    # Punto de entrada
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx               # Router principal (rutas públicas vs /admin)
│   │
│   ├── api/                  # Capa de acceso a la API (Axios)
│   │   ├── client.js         # Instancia Axios con baseURL e interceptores
│   │   ├── equipos.js
│   │   ├── partidos.js
│   │   └── eventos.js
│   │
│   ├── components/           # Componentes reutilizables
│   │   ├── ui/               # Botones, badges, cards genéricas
│   │   └── handball/         # Específicos del torneo (TarjetaPartido, etc.)
│   │
│   ├── pages/
│   │   ├── public/           # Vistas sin login
│   │   │   ├── HomePage.jsx       # Tabla de posiciones + próximos partidos
│   │   │   ├── FixturePage.jsx    # Todos los partidos
│   │   │   └── EstadisticasPage.jsx  # Goleadores, tarjetas
│   │   │
│   │   └── admin/            # Vistas con login (/admin/*)
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── EquiposPage.jsx
│   │       ├── JugadoresPage.jsx
│   │       ├── FixtureAdminPage.jsx
│   │       └── PlanillaPage.jsx   # ⭐ Formulario de partido en vivo
│   │
│   ├── context/
│   │   └── AuthContext.jsx   # Estado global de autenticación
│   │
│   └── hooks/
│       └── useAuth.js        # Hook para proteger rutas de admin
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🔌 API Endpoints

### Auth
| Método | Ruta              | Descripción              | Auth |
|--------|-------------------|--------------------------|------|
| POST   | /api/auth/login   | Login organizador        | ❌   |

### Equipos
| Método | Ruta                  | Descripción        | Auth |
|--------|-----------------------|--------------------|------|
| GET    | /api/equipos          | Listar todos       | ❌   |
| POST   | /api/equipos          | Crear equipo       | ✅   |
| PUT    | /api/equipos/:id      | Editar equipo      | ✅   |
| DELETE | /api/equipos/:id      | Eliminar equipo    | ✅   |

### Jugadores
| Método | Ruta                     | Descripción             | Auth |
|--------|--------------------------|-------------------------|------|
| GET    | /api/jugadores           | Listar todos            | ❌   |
| GET    | /api/jugadores?equipo=id | Filtrar por equipo      | ❌   |
| POST   | /api/jugadores           | Crear jugador           | ✅   |
| PUT    | /api/jugadores/:id       | Editar jugador          | ✅   |
| DELETE | /api/jugadores/:id       | Eliminar jugador        | ✅   |

### Partidos
| Método | Ruta                          | Descripción                        | Auth |
|--------|-------------------------------|------------------------------------|------|
| GET    | /api/partidos                 | Listar todos (fixture público)     | ❌   |
| GET    | /api/partidos/:id             | Detalle con eventos                | ❌   |
| POST   | /api/partidos                 | Crear partido                      | ✅   |
| PUT    | /api/partidos/:id             | Editar partido                     | ✅   |
| PATCH  | /api/partidos/:id/estado      | Cambiar estado (iniciar/finalizar) | ✅   |
| DELETE | /api/partidos/:id             | Eliminar partido                   | ✅   |

### Eventos (Planilla)
| Método | Ruta                  | Descripción                  | Auth |
|--------|-----------------------|------------------------------|------|
| GET    | /api/eventos?partido=id | Eventos de un partido      | ❌   |
| POST   | /api/eventos          | Registrar gol/tarjeta        | ✅   |
| DELETE | /api/eventos/:id      | Deshacer evento              | ✅   |

### Estadísticas (calculadas)
| Método | Ruta                       | Descripción            | Auth |
|--------|----------------------------|------------------------|------|
| GET    | /api/estadisticas/posiciones | Tabla de posiciones  | ❌   |
| GET    | /api/estadisticas/goleadores | Top goleadores       | ❌   |
| GET    | /api/estadisticas/tarjetas   | Jugadores con tarjetas| ❌  |

---

## 📋 Fases de Desarrollo

### Fase 1 — Fundación del Backend (2–3 días)
- [ ] Crear proyecto Flask con factory pattern (`create_app`)
- [ ] Configurar SQLAlchemy + Alembic
- [ ] Definir los 4 modelos (Equipo, Jugador, Partido, Evento)
- [ ] Primera migración y seed data de prueba
- [ ] Endpoints de Equipos y Jugadores con JWT

### Fase 2 — Partidos y Planilla (2–3 días)
- [ ] Endpoints de Partidos (CRUD + cambio de estado)
- [ ] Endpoints de Eventos (registrar gol/tarjeta, deshacer)
- [ ] Servicio que recalcula `goles_local` / `goles_visitante` automáticamente
- [ ] Endpoint de estadísticas (posiciones, goleadores, tarjetas)

### Fase 3 — Frontend Público (2–3 días)
- [ ] Setup React + Vite + Tailwind + React Router
- [ ] Capa de API (Axios client)
- [ ] Página de inicio: tabla de posiciones + próximos partidos
- [ ] Página de fixture completo
- [ ] Página de estadísticas (goleadores, tarjetas)

### Fase 4 — Panel Admin (3–4 días)
- [ ] Login con JWT (AuthContext)
- [ ] Rutas protegidas (`/admin/*`)
- [ ] CRUD de equipos y jugadores
- [ ] Gestión del fixture
- [ ] **Planilla digital móvil**: registro de eventos en vivo

### Fase 5 — Deploy y Pulido (1–2 días)
- [ ] Variables de entorno y configuración de producción
- [ ] Deploy backend en Render + PostgreSQL en Supabase
- [ ] Deploy frontend en Vercel
- [ ] Pruebas end-to-end

---

## 🔐 Seguridad

- Un solo usuario organizador (credenciales en `.env`, sin registro público)
- JWT con expiración de 8 horas
- Todas las rutas de escritura protegidas con `@jwt_required()`
- CORS configurado solo para el dominio del frontend en producción

---

## 🌱 Variables de Entorno (`.env`)

```env
FLASK_ENV=development
SECRET_KEY=cambiar_esto_en_produccion
JWT_SECRET_KEY=cambiar_esto_en_produccion
DATABASE_URL=sqlite:///hublecop_dev.db

# Credenciales del organizador
ADMIN_USERNAME=organizador
ADMIN_PASSWORD=cambiar_esto

# En producción (Supabase):
# DATABASE_URL=postgresql://user:pass@host:port/dbname
```

---

## 💡 Convenciones de Código

- **Python:** snake_case, type hints donde sea posible, docstrings en funciones de servicio
- **JavaScript/JSX:** camelCase para variables, PascalCase para componentes
- **Commits:** `feat:`, `fix:`, `chore:` (Conventional Commits)
- **Ramas:** `main` (producción), `dev` (desarrollo), `feature/nombre-feature`
- **IDs:** UUID v4 en todos los modelos (más seguro que enteros secuenciales en APIs públicas)

---

## 📌 Decisiones de Arquitectura

| Decisión | Alternativa descartada | Razón |
|----------|------------------------|-------|
| Flask en vez de FastAPI | FastAPI | Experiencia previa del equipo (Bite-Now) |
| SQLite en dev / PostgreSQL en prod | Solo PostgreSQL | Facilita arranque sin configurar nada |
| React + Vite en vez de Next.js | Next.js | No necesitamos SSR, SPA es suficiente |
| Un solo rol (organizador) | Sistema de roles | El torneo tiene un solo organizador |
| UUID en vez de INT autoincremental | SERIAL / AUTOINCREMENT | Más seguro en endpoints públicos |