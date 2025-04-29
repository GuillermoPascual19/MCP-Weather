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
        const apiUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        apiUrl.searchParams.append('name', city);

        const data = await fetch(apiUrl.toString()).then((res) => res.json())

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
       
        const {latitude, longitude} = data.results[0]

        const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
        weatherUrl.searchParams.append("latitude", latitude.toString())
        weatherUrl.searchParams.append("longitude", longitude.toString())
        weatherUrl.searchParams.append("current", "temperature_2m,is_day,precipitation,rain")

        console.log(weatherUrl)
        const weatherData = await fetch(weatherUrl.toString()).then((res) => res.json())
        
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(weatherData, null, 2),
                }
            ]
        }
    }
)

//Escuchar las conexiones de los clientes
const transport = new StdioServerTransport()
await server.connect(transport)

