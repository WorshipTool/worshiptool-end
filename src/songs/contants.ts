

export const takeOneMore = true;

export const takePerPage = 10+(takeOneMore?1:0);

export const skipForPage = (page:number) => (page)*(takePerPage-(takeOneMore?1:0));