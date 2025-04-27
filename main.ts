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
        return {
            content: [
                {
                    type: 'text',
                    text: `The current weather in ${city} is sunny`,
                }
            ]
        }
    }
)

//Escuchar las conexiones de los clientes
const transport = new StdioServerTransport()
await server.connect(transport)