//export const formatDate = (dateStr) => {
  // const date = new Date(dateStr)
  // const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  // const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  // const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  // const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  // return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`

  
  //== Bug 1 (fix 2/2): change previous dateStr to an ISO date  object, and split it to return only the year, month, and day

  export const formatDate = (dateIso) => {
   const date = new Date(dateIso);  
  
   const isoString = date.toISOString(); 
 
   const party = isoString.split('T'); 
  
   return party[0];
  }

 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}