import xhr  from './xhr/httpClient'
import Utils from 'UTILS/utils' 

class AudioServices {
    queryAudioDetail(options) {
        let param = {
            url: '/audio/queryAudioChapterDetail.do',
            data: {
            	orderId: options.orderId,
                columnId: options.columnId
            }
        }

        xhr.post(param).then((result)=>{
			if(options.callback && typeof options.callback == 'function' ){				
				options.callback(result);
			}
		}).catch((error) => {
			console.log('queryAudioDetail fail' +error);          
		});
    }    
    /**
     * [getCatalog 查询目录]
     * @return {[type]} [description]
     */
    getCatalog (options) {
        let param = {
            url: '/audio/queryAudioCatalog.do',
            data: {
                columnId: options.columnId,               
                paging: options.paging
            }            
        }

        xhr.post(param).then((result)=>{
            if(options.callback && typeof options.callback == 'function' ){             
                options.callback(result);
            }            
        }).catch((error) => {
            console.log('getCatalog fail' +error);
        });
    }
    /**
     * [getRecommendAudio 听书推荐位]
     * @param  {[type]} options [description]
     */
    getRecommendAudio(options) {
        let param = {
            url: '/audio/getRecommendAudio.do',
            data: {
                recommendId: options.recommendId,
                terminal: options.terminal || 4,
                size: options.size
            }            
        }

        xhr.post(param).then((result)=>{
            if(options.callback && typeof options.callback == 'function' ){             
                options.callback(result);
            }            
        }).catch((error) => {
            console.log('getRecommendAudio fail' +error);
        });
    }

    /**
     * [getAudioColumnRecommend 听书栏目推荐]
     * @param  {[type]} options [description]   
     */
    getAudioColumnRecommend (options) {
        let param = {
            url: '/audio/getAudioColumnRecommend.do',
            data: {            
                contentType: options.contentType || 7 ,
                size: options.size || 9  ,
                sortType: options.sortType ,                         
            }
        };        
      
        xhr.post(param).then((results) => {
            if(options.callback && typeof options.callback == 'function' ){
                options.callback(results);
            }    
        }).catch((error) => {
            console.log('getSystemConfig fail' +error);
        });
    }
}

export default new AudioServices()