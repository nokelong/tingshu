import config from './config'
import axios  from 'axios'

class xhr {
	get(param) {
      const promise = axios.get(param.url,config)
          .then((response)=>{
              let result = (response.data);
       	      let resultCode = result.resultCode;     	   
              return Promise.resolve(result)     	   
          }).catch((error)=>{
              console.log(error);            
              return Promise.reject(error)            
          })
      return promise;
	}

	post(param){  

      const promise = axios.post(param.url, param.data, config).then((response) =>{
          let result = (response.data);     	 
          return Promise.resolve(result)       	
      }).catch((error)=>{
          console.log(error);
          return Promise.reject(error)
      });
      
      return promise;
	}
}

export default new xhr();