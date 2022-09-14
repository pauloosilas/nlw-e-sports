import express, { response } from 'express'
import {PrismaClient} from '@prisma/client'
import cors from 'cors'
import { convertHourStringToMinutes } from './utils/convert-hous-string-to-minutes';
import { convertMinutesToHourString } from './utils/convert-minutes-to-hour-string';

const app = express();
app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
    log: ['query']
})

app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include:{
            _count:{
                select:{
                    ads:true,
                }
            }
        }
    })
    return res.json(games);
})

app.post('/games/:id/ads', async (req, res) => {
    const gameId = req.params.id;
    const body = req.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name:            body.name,
            yearsPlaying:    body.yearsPlaying,    
            discord:         body.discord,  
            weekDays:        body.weekDays.join(','), 
            hourStart:       convertHourStringToMinutes(body.hourStart), 
            hourEnd:         convertHourStringToMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
            
        }
    })

    return res.status(201).json(ad);
})

app.get('/games/:id/ads', async(req, res) =>{
    const gameId = req.params.id;

    const ads = await prisma.ad.findMany({
        select:{
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where:{
            gameId,
        },
        orderBy:{
            createdAt: 'desc',
        }
    })

    return res.send(ads.map(ad => {
        return{
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesToHourString(ad.hourStart),
            hourEnd: convertMinutesToHourString(ad.hourEnd),
        }
    }));

    return res.json(
        [
            {id: 1, name: 'Anuncio 1'},
            {id: 2, name: 'Anuncio 2'},
            {id: 3, name: 'Anuncio 3'},
            {id: 4, name: 'Anuncio 4'},
            {id: 5, name: 'Anuncio 5'},
        ]
    )
})


app.get('/ads/:id/discord', async (req, res) =>{
    const adId = req.params.id;
   
    const ad = await prisma.ad.findFirstOrThrow({
        select:{
            discord:true,
        },
        where:{
          id: adId
        }
    })
    
  
    return res.json({
        discord: ad.discord,
    })
})

app.listen(3000)