import { apiFetch } from "./api";
import { User } from "./authSlice";

const url = [
    {href:'/analytics/total-users',roles:["ADMIN","FUNCIONARIO"],name:"Total Users"},
    {href:'/analytics/total-bookings',roles:["ADMIN","FUNCIONARIO"],name:"Total Marcações"},
    {href:'/analytics/average-bookings-per-user',roles:["ADMIN","FUNCIONARIO"],name:"Média Marcações por Utilizador"},
    {href:'/analytics/most-used-overall',roles:["ADMIN","FUNCIONARIO"],name:"Mais Usado (Global)"},
    {href:'/analytics/most-used-overall/',roles:["CLIENTE"],name:"Mais Usado (Global)"},
    {href:'/analytics/most-frequent-time/',roles:["ADMIN","FUNCIONARIO","CLIENTE"],name:"Hora Mais Frequente", needDays: true},
    {href:'/analytics/most-frequent-time/',roles:["CLIENTE"],name:"Hora Mais Frequente" , needDays: true},
    {href:'/analytics/most-employee-worked',roles:["ADMIN","FUNCIONARIO"],name:"Funcionário Mais Trabalhou"}
]

export async function getAnalytic(user:User|null, days?:number) {
    const userRole = user?.userRole || "CLIENTE";
    

    const urlFilter = url
        .filter(item => item.roles.includes(userRole) && (!item.needDays || (item.needDays && days !== undefined)))
        .map(item => {
            let href = item.href;
            
            if (item.needDays && days !== undefined) {
                href+=days+'/';
            }

            if (item.roles.includes("CLIENTE") && userRole === "CLIENTE") {
                href +=user?.userId;
            }

            return {href ,name:item.name};
        });

    const results: {name: string, data: any}[] = [];

    await Promise.all(urlFilter.map(async (item) => {

        const res = await apiFetch(item.href, { method: 'GET'})

        if (!res.ok) {
            console.error('Failed to fetch '+item.href+': '+res.status+' '+res.statusText);
            return;
        }

        const data = await res.json();
        results.push({name:item.name,data});
    }));

    return results;
}
