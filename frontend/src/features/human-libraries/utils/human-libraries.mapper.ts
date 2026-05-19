import type {
  DelegationContactView,
  DelegationTab,
  HumanBookApiItem,
  HumanBookCardView,
  PublicRegionApiItem,
} from '../types/human-libraries.types';

const toDelegationSlug = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeApiBaseUrl = (baseUrl: string): string =>
  baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

const buildDownloadUrl = (slug: string): string => {
  const baseUrl = normalizeApiBaseUrl(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  );

  return `${baseUrl}/human-books/${slug}/download`;
};

const buildCardSummary = (book: HumanBookApiItem): string =>
  `${book.name} comparte el testimonio "${book.title}" en la delegación de ${book.region.name}.`;

const buildMapQuery = (region: PublicRegionApiItem): string => {
  const address = region.address.trim();

  if (address.length > 0) {
    return address;
  }

  return region.name;
};

export const mapDelegationTabs = (regions: PublicRegionApiItem[]): DelegationTab[] =>
  regions
    .map((region) => ({
      id: region.id,
      label: region.name,
      slug: toDelegationSlug(region.name),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'es'));

export const mapDelegationContacts = (
  regions: PublicRegionApiItem[],
): Record<number, DelegationContactView> =>
  regions.reduce((accumulator, region) => {
    accumulator[region.id] = {
      id: region.id,
      label: region.name,
      address: region.address,
      email: region.email,
      phone: region.phone,
      mapQuery: buildMapQuery(region),
    };

    return accumulator;
  }, {} as Record<number, DelegationContactView>);

export const mapHumanBooksByRegion = (
  books: HumanBookApiItem[],
): Record<number, HumanBookCardView[]> =>
  books.reduce((accumulator, book) => {
    const regionId = book.region.id;

    if (!accumulator[regionId]) {
      accumulator[regionId] = [];
    }

    accumulator[regionId].push({
      id: book.id,
      name: book.name,
      title: book.title,
      summary: buildCardSummary(book),
      slug: book.slug,
      pdfOriginalName: book.pdfOriginalName,
      downloadUrl: buildDownloadUrl(book.slug),
    });

    return accumulator;
  }, {} as Record<number, HumanBookCardView[]>);
