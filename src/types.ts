export interface DhikrPhrase {
  id: number;
  text: string;
  type: 'tasbih' | 'tahmid' | 'takbir';
}

export interface DhikrState {
  count: number;
  currentType: 'tasbih' | 'tahmid' | 'takbir';
  displayMode: 'dynamic' | 'list' | 'focus';
  totalCount: number;
}