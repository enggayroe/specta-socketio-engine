import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalApiService {

    async fetchDataFromExternalApi(): Promise<any> {
        const apiUrl = 'http://127.0.0.1:8082/api/test';

        try {
            const response = await axios.get(apiUrl);
            return response.data;
        } catch (error) {
            // Handle error
            throw new Error('Failed to fetch data from external API');
        }
    }

}
