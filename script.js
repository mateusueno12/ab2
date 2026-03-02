// script.js
class CepSearch {
    constructor() {
        this.form = document.getElementById('cepForm');
        this.searchBtn = document.getElementById('searchBtn');
        this.resultsBox = document.getElementById('resultsBox');
        this.resultsContent = document.getElementById('resultsContent');
        this.errorBox = document.getElementById('errorBox');
        this.errorMessage = document.getElementById('errorMessage');
        this.loadingBox = document.getElementById('loadingBox');
        
        this.logradouro = document.getElementById('logradouro');
        this.cidade = document.getElementById('cidade');
        this.estado = document.getElementById('estado');
        
        this.init();
    }
    
    init() {
        // Adiciona event listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        document.getElementById('newSearchBtn').addEventListener('click', () => this.resetForm());
        document.getElementById('tryAgainBtn').addEventListener('click', () => this.resetForm());
        
        // Adiciona validação em tempo real
        this.logradouro.addEventListener('input', () => this.validateField(this.logradouro));
        this.cidade.addEventListener('input', () => this.validateField(this.cidade));
        this.estado.addEventListener('change', () => this.validateField(this.estado));
    }
    
    validateField(field) {
        if (field.value.trim() === '') {
            field.style.borderColor = '#dc3545';
            return false;
        } else {
            field.style.borderColor = '#5e72e4';
            return true;
        }
    }
    
    validateForm() {
        const isLogradouroValid = this.validateField(this.logradouro);
        const isCidadeValid = this.validateField(this.cidade);
        const isEstadoValid = this.validateField(this.estado);
        
        return isLogradouroValid && isCidadeValid && isEstadoValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        const endereco = {
            logradouro: this.logradouro.value.trim(),
            cidade: this.cidade.value.trim(),
            estado: this.estado.value
        };
        
        await this.searchCep(endereco);
    }
    
    async searchCep(endereco) {
        this.showLoading();
        
        try {
            // URL da API ViaCEP para busca por endereço
            const url = `https://viacep.com.br/ws/${endereco.estado}/${endereco.cidade}/${endereco.logradouro}/json/`;
            
            console.log('Buscando CEP para:', endereco);
            console.log('URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Erro na comunicação com o servidor');
            }
            
            const data = await response.json();
            
            // Verifica se a API retornou erro
            if (data.erro) {
                throw new Error('Nenhum CEP encontrado para este endereço. Verifique os dados informados.');
            }
            
            // Verifica se retornou múltiplos resultados
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    throw new Error('Nenhum CEP encontrado para este endereço.');
                }
                this.displayMultipleResults(data);
            } else {
                this.displaySingleResult(data);
            }
            
        } catch (error) {
            console.error('Erro detalhado:', error);
            this.showError(error.message || 'Erro ao buscar CEP. Tente novamente.');
        }
    }
    
    displaySingleResult(data) {
        const html = `
            <div class="result-item full-width">
                <div class="result-label"><i class="fas fa-map-pin"></i> CEP Encontrado:</div>
                <div class="result-value cep">${this.formatCep(data.cep)}</div>
            </div>
            <div class="result-item">
                <div class="result-label"><i class="fas fa-road"></i> Logradouro:</div>
                <div class="result-value">${data.logradouro || 'Não informado'}</div>
            </div>
            <div class="result-item">
                <div class="result-label"><i class="fas fa-home"></i> Complemento:</div>
                <div class="result-value">${data.complemento || 'Não informado'}</div>
            </div>
            <div class="result-item">
                <div class="result-label"><i class="fas fa-building"></i> Bairro:</div>
                <div class="result-value">${data.bairro || 'Não informado'}</div>
            </div>
            <div class="result-item">
                <div class="result-label"><i class="fas fa-city"></i> Cidade:</div>
                <div class="result-value">${data.localidade || 'Não informado'}</div>
            </div>
            <div class="result-item">
                <div class="result-label"><i class="fas fa-map"></i> Estado:</div>
                <div class="result-value">${data.uf || 'Não informado'}</div>
            </div>
            <div class="result-item">
                <div class="result-label"><i class="fas fa-phone"></i> DDD:</div>
                <div class="result-value">${data.ddd || 'Não informado'}</div>
            </div>
            <div class="result-item">
                <div class="result-label"><i class="fas fa-code"></i> IBGE:</div>
                <div class="result-value">${data.ibge || 'Não informado'}</div>
            </div>
        `;
        
        this.resultsContent.innerHTML = html;
        this.showResults();
    }
    
    displayMultipleResults(results) {
        let html = `
            <div class="result-item full-width">
                <div class="result-label"><i class="fas fa-list"></i> Múltiplos CEPs encontrados:</div>
                <div class="result-value">Foram encontrados ${results.length} CEPs para este endereço.</div>
            </div>
        `;
        
        results.forEach((result, index) => {
            html += `
                <div class="result-item full-width" style="margin-top: ${index > 0 ? '15px' : '0'};">
                    <div class="result-label"><i class="fas fa-map-pin"></i> CEP ${index + 1}:</div>
                    <div class="result-value cep">${this.formatCep(result.cep)}</div>
                    <div class="result-label" style="margin-top: 10px;">Logradouro:</div>
                    <div class="result-value">${result.logradouro}</div>
                    <div class="result-label">Bairro:</div>
                    <div class="result-value">${result.bairro}</div>
                    <div class="result-label">Complemento:</div>
                    <div class="result-value">${result.complemento || 'Não informado'}</div>
                </div>
            `;
        });
        
        this.resultsContent.innerHTML = html;
        this.showResults();
    }
    
    formatCep(cep) {
        // Formata o CEP no padrão 00000-000
        if (cep && cep.length === 8) {
            return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
        }
        return cep;
    }
    
    showResults() {
        this.loadingBox.style.display = 'none';
        this.errorBox.style.display = 'none';
        this.resultsBox.style.display = 'block';
        
        // Scroll suave até os resultados
        this.resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    showError(message) {
        this.loadingBox.style.display = 'none';
        this.resultsBox.style.display = 'none';
        this.errorMessage.textContent = message;
        this.errorBox.style.display = 'block';
    }
    
    showLoading() {
        this.resultsBox.style.display = 'none';
        this.errorBox.style.display = 'none';
        this.loadingBox.style.display = 'block';
    }
    
    resetForm() {
        // Esconde as caixas de resultado/erro
        this.resultsBox.style.display = 'none';
        this.errorBox.style.display = 'none';
        this.loadingBox.style.display = 'none';
        
        // Limpa o formulário
        this.form.reset();
        
        // Reseta as cores dos campos
        this.logradouro.style.borderColor = '#e0e0e0';
        this.cidade.style.borderColor = '#e0e0e0';
        this.estado.style.borderColor = '#e0e0e0';
        
        // Foca no primeiro campo
        this.logradouro.focus();
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CepSearch();
    
    // Adiciona alguns exemplos para teste
    console.log('Exemplos para teste:');
    console.log('Rua: Augusta, Cidade: São Paulo, Estado: SP');
    console.log('Avenida: Paulista, Cidade: São Paulo, Estado: SP');
    console.log('Rua: da Assembleia, Cidade: Rio de Janeiro, Estado: RJ');
});
