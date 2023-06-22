import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
    
  safelyParseJSON(json: any) {
    // This function cannot be optimised, it's best to
    // keep it small!
    let parsed: any;
    try {
      parsed = JSON.parse(json);
    } catch (e) {
      // Oh well, but whatever...
      // parsed = null;
    }
    return parsed; // Could be undefined!
  }
  
}
