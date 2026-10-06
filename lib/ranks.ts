export const CONTRIBUTOR_RANKS = [
  {min:0, name:'Nováček', icon:'🦤'},
  {min:3, name:'Průzkumník', icon:'🧭'},
  {min:10, name:'Lovec', icon:'🦖'},
  {min:25, name:'Kartograf', icon:'🗺️'},
  {min:50, name:'Expert Tharatu', icon:'💎'},
  {min:100, name:'Legenda Tharatu', icon:'👑'},
] as const;
export function contributorRank(count:number){
  const n=Math.max(0,Number(count)||0); let index=0;
  for(let i=0;i<CONTRIBUTOR_RANKS.length;i++) if(n>=CONTRIBUTOR_RANKS[i].min) index=i;
  const rank=CONTRIBUTOR_RANKS[index], next=CONTRIBUTOR_RANKS[index+1]||null;
  const base=rank.min, target=next?.min??base;
  const progress=next?Math.max(0,Math.min(100,((n-base)/(target-base))*100)):100;
  return {rank,next,count:n,progress,remaining:next?Math.max(0,next.min-n):0};
}
