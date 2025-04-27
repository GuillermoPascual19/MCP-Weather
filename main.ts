import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";


//Crear el servidor 
//Es la interfaz del servidor, donde se definen los datos que se van a enviar y recibir
//Maneja la comunicación entre el cliente y el servidor
const server = new McpServer({
    name: 'MyWeatherApp',
    version: '1.0.0',
    description: 'A weather application that provides current weather data.',
});

//Definir las herramientas 
//Las herramientas le permite al LLM realizar acciones a través de tu servidor
server.tool(
    'fetchWeather', //Titulo de la herramienta
    'Tool to fetch current weather data for a given city.', //Descripción de la herramienta
    {
        city: z.string().describe('The name of the city to fetch weather data for.'),
    },
    async ({ city }) => {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`)
        const data = await response.json()

        if(data.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `No weather data available for ${city}.`,
                    }
                ]
            }
        }
        
       
        const temperature = data?.[0]?.temperature || 'No temperature data available.'
        const {latitude, longitude} = data.results[0]

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain&forecast_days=1`)
        const weatherData = await weatherResponse.json()

        
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(data, null, 2),
                }
            ]
        }
    }
)

//Escuchar las conexiones de los clientes
const transport = new StdioServerTransport()
await server.connect(transport)


//INSTALAR EL INSPECTOR, IMPORTANTE