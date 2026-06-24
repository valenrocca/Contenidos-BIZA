export interface CountryLink {
  name: string;
  flag: string;
  url: string | null;
}

export const COUNTRY_LINKS: CountryLink[] = [
  {
    name: 'Argentina',
    flag: '🇦🇷',
    url: 'https://www.adidas.com.ar/gorra-bzrp/KE1174.html',
  },
  {
    name: 'Perú',
    flag: '🇵🇪',
    url: 'https://www.adidas.pe/gorra-bzrp/KE1174.html',
  },
  {
    name: 'Colombia',
    flag: '🇨🇴',
    url: 'https://www.adidas.co/gorra-bzrp/KE1174.html',
  },
  {
    name: 'México',
    flag: '🇲🇽',
    url: 'https://www.adidas.mx/gorra-bzrp/KE1174.html',
  },
];
