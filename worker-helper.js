export function runWorker(worker, message) {
  return new Promise((resolve, reject) => {
    // Handler para a resposta do worker
    function handleMessage(event) {
      resolve(event.data);
      worker.removeEventListener('message', handleMessage);
    }
    
    // Handler para erros do worker
    function handleError(error) {
      reject(error);
      worker.removeEventListener('error', handleError);
    }
    
    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // Envia a mensagem para o worker
    worker.postMessage(message);
  });
}