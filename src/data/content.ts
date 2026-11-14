export const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'contacto', label: 'Contacto' },
] as const

export type SectionId = (typeof sections)[number]['id']

export const links = {
  email: 'mailto:tiagodavila08@gmail.com',
  emailLabel: 'tiagodavila08@gmail.com',
  linkedin: 'https://www.linkedin.com/in/tiago-davila-895b51231/',
  github: 'https://github.com/Tiago-Davila',
}

export const hero = {
  eyebrow: 'Manifiesto',
  title: ['Hola, soy *Tiago.*', 'Diseño y desarrollo', 'productos web que', 'funcionan de punta', 'a punta.'],
}

export const projects = [
  {
    id: 'provex',
    name: 'Provex',
    url: 'https://provexx.vercel.app/',
    domain: 'provexx.vercel.app',
    tags: ['Sitio corporativo', 'Servicios'],
    description:
      'Página institucional con foco en servicios, preguntas frecuentes y una navegación clara para usuarios nuevos.',
    image: '/projects/provex.jpg',
    rows: [
      ['Tipo', 'Sitio corporativo'],
      ['Foco', 'Servicios y FAQ'],
      ['Estado', 'Online'],
    ],
  },
  {
    id: 'politon',
    name: 'Politón',
    url: 'https://politon.ipm.edu.ar/',
    domain: 'politon.ipm.edu.ar',
    tags: ['Hackathon', 'Landing page'],
    description:
      'Landing page para la hackathon de mi colegio, con links a formulario e información del evento.',
    image: null,
    rows: [
      ['Tipo', 'Landing page'],
      ['Evento', 'Hackathon IPM'],
      ['Estado', 'Online'],
    ],
  },
] as const

export const about = {
  eyebrow: 'Sobre mí',
  title: ['Lo que', '*hago*'],
  paragraphs: [
    'Soy Tiago Dávila, desarrollador full-stack. Diseño y desarrollo productos web rápidos, interfaces claras y aplicaciones con backend real, conectando frontend, APIs y bases de datos para que cada proyecto funcione de punta a punta.',
    'Actualmente estudio en el Instituto Politécnico Modelo, donde estoy cursando mi último año. Sigo ampliando mis conocimientos en desarrollo de aplicaciones web y me enfoco en proyectos para colegios, servicios y herramientas digitales que combinen buena experiencia visual con una base técnica sólida.',
  ],
  services: [
    {
      n: '01',
      title: 'Desarrollo Frontend',
      body: 'Interfaces con React, animaciones fluidas con GSAP y Framer Motion.',
    },
    {
      n: '02',
      title: 'Desarrollo Backend',
      body: 'APIs REST con Node.js, Java y Spring Boot. Bases de datos relacionales y NoSQL.',
    },
    {
      n: '03',
      title: 'Diseño UI/UX',
      body: 'Diseño de interfaces en Figma con foco en la experiencia de usuario, jerarquía visual y sistemas de diseño.',
    },
  ],
}

export const skills = {
  eyebrow: 'Stack técnico',
  title: ['Habilidades'],
  groups: [
    { name: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'HTML & CSS', 'GSAP', 'Tailwind'] },
    { name: 'Backend', items: ['Java', 'Spring Boot', 'MongoDB', 'Supabase', 'Nginx', 'Apache'] },
    { name: 'Tools', items: ['Git', 'GitHub', 'Linux', 'Docker', 'VS Code', 'REST APIs', 'Vercel'] },
    { name: 'Design', items: ['Figma', 'UI/UX', 'Prototyping'] },
  ],
}

export const contact = {
  eyebrow: '¿Tenés un proyecto?',
  title: ['Construyamos', 'algo', '*juntos.*'],
  rows: [
    { label: 'Mail', value: 'tiagodavila08@gmail.com', href: links.email },
    { label: 'LinkedIn', value: 'tiago-davila', href: links.linkedin },
    { label: 'GitHub', value: 'Tiago-Davila', href: links.github },
  ],
  footer: '© 2026 Tiago Dávila. Todos los derechos reservados.',
}
