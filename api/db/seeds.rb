# Dados de demonstração da vitrine. Idempotente: pode rodar de novo sem duplicar
# nem apagar anúncios reais criados por usuários.

USERS = [
  { name: "Ana Souza", email: "ana@aluno.unifor.br", course: "Ciência da Computação" },
  { name: "Bruno Lima", email: "bruno@aluno.unifor.br", course: "Engenharia Civil" },
  { name: "Carla Menezes", email: "carla@aluno.unifor.br", course: "Medicina" },
  { name: "Diego Ferreira", email: "diego@aluno.unifor.br", course: "Análise e Desenvolvimento de Sistemas" },
  { name: "Elisa Rocha", email: "elisa@aluno.unifor.br", course: "Arquitetura" },
  { name: "Felipe Andrade", email: "felipe@aluno.unifor.br", course: "Direito" }
].freeze

SEED_PASSWORD = "vortex2026".freeze

LISTINGS = [
  { title: "Cálculo A — Diva Fleming", description: "Livro usado, algumas anotações a lápis nos capítulos de limites. Serve para Cálculo I.", category: "Livros", kind: "sale", price_cents: 4500 },
  { title: "Física I — Halliday & Resnick", description: "Volume 1, capa dura, sem rasuras. Usei por dois semestres.", category: "Livros", kind: "sale", price_cents: 6000 },
  { title: "Álgebra Linear — Boldrini", description: "Passando adiante para quem está entrando no curso. Estado razoável.", category: "Livros", kind: "donation" },
  { title: "Química Geral — Atkins", description: "Edição recente, praticamente sem uso. Acompanha caderno de exercícios.", category: "Livros", kind: "sale", price_cents: 5500 },
  { title: "Atlas de Anatomia — Sobotta", description: "Dois volumes, ilustrações intactas. Item caro na livraria, saindo por menos da metade.", category: "Livros", kind: "sale", price_cents: 12000 },
  { title: "Direito Constitucional — Curso completo", description: "Doando para quem está começando. Tem grifos de marca-texto.", category: "Livros", kind: "donation" },
  { title: "Kit de desenho técnico completo", description: "Régua paralela, compasso, lapiseiras 0.5 e 0.7 e gabaritos. Tudo funcionando.", category: "Engenharia", kind: "sale", price_cents: 3500 },
  { title: "Capacete de obra branco", description: "Usado em duas visitas técnicas. Doando porque troquei pelo da empresa.", category: "Engenharia", kind: "donation" },
  { title: "Estojo de esquadros 30/60 e 45", description: "Acrílico transparente, sem trincos.", category: "Engenharia", kind: "sale", price_cents: 2000 },
  { title: "Trena laser 40m", description: "Bateria segura carga, vem com estojo. Ótima para topografia.", category: "Engenharia", kind: "sale", price_cents: 8000 },
  { title: "Escala triangular 30cm", description: "Doando junto com o kit de desenho se o interessado levar os dois.", category: "Engenharia", kind: "donation" },
  { title: "Arduino Uno R3 original", description: "Placa original, testada, acompanha cabo USB.", category: "Computação", kind: "sale", price_cents: 7000 },
  { title: "Protoboard 830 furos + 65 jumpers", description: "Usado só na disciplina de sistemas embarcados.", category: "Computação", kind: "sale", price_cents: 2500 },
  { title: "HD externo 500GB", description: "Funcionando perfeitamente, já formatado. Cabo incluso.", category: "Computação", kind: "sale", price_cents: 9000 },
  { title: "Teclado mecânico switch brown", description: "ABNT2, iluminação branca. Vendo porque comprei outro.", category: "Computação", kind: "sale", price_cents: 15000 },
  { title: "Raspberry Pi 3 Model B", description: "Com fonte, case e cartão SD de 32GB já com Raspbian.", category: "Computação", kind: "sale", price_cents: 18000 },
  { title: "Kit de resistores sortidos", description: "Sobra do projeto de eletrônica. Doando para quem for usar.", category: "Computação", kind: "donation" },
  { title: "Jaleco branco tamanho M", description: "Manga longa, lavado e higienizado. Serve para aulas práticas.", category: "Saúde", kind: "donation" },
  { title: "Estetoscópio Littmann Classic III", description: "Comprado no ano passado, pouquíssimo uso. Acompanha olivas extras.", category: "Saúde", kind: "sale", price_cents: 25000 },
  { title: "Esfigmomanômetro aneroide", description: "Calibrado, braçadeira adulto padrão.", category: "Saúde", kind: "sale", price_cents: 8500 },
  { title: "Jaleco branco tamanho G", description: "Ficou grande em mim. Doando para quem precisar.", category: "Saúde", kind: "donation" },
  { title: "Cadeira de escritório com rodinhas", description: "Encosto ajustável, tecido em bom estado. Retirar no Benfica.", category: "Móveis", kind: "sale", price_cents: 12000 },
  { title: "Escrivaninha pequena de MDF", description: "Doando na mudança de apartamento. Precisa de retirada no fim do mês.", category: "Móveis", kind: "donation" },
  { title: "Estante de livros 5 prateleiras", description: "Madeira maciça, desmontável. Cabe em porta-malas de sedã.", category: "Móveis", kind: "sale", price_cents: 15000 },
  { title: "Luminária de mesa com LED", description: "Três níveis de brilho, braço articulado.", category: "Móveis", kind: "sale", price_cents: 4000 },
  { title: "Calculadora HP 12C", description: "Financeira, original, com manual. Essencial em Contábeis e Economia.", category: "Eletrônicos", kind: "sale", price_cents: 22000 },
  { title: "Calculadora científica Casio fx-991", description: "Todas as funções operando, visor sem riscos.", category: "Eletrônicos", kind: "sale", price_cents: 6000 },
  { title: "Fone com cancelamento de ruído", description: "Bateria dura umas 20h. Ótimo para estudar na biblioteca.", category: "Eletrônicos", kind: "sale", price_cents: 18000 },
  { title: "Webcam HD 1080p", description: "Sobrou do período de aulas remotas. Plug and play.", category: "Eletrônicos", kind: "sale", price_cents: 9000 },
  { title: "Mochila reforçada para notebook", description: "Compartimento acolchoado até 15 polegadas. Zíperes intactos.", category: "Outros", kind: "donation" },
  { title: "Garrafa térmica 1L", description: "Mantém gelado o dia inteiro. Usada em duas semanas de aula.", category: "Outros", kind: "sale", price_cents: 3000 }
].freeze

users = USERS.map do |attributes|
  User.find_or_create_by!(email: attributes[:email]) do |user|
    user.name = attributes[:name]
    user.course = attributes[:course]
    user.password = SEED_PASSWORD
  end
end

LISTINGS.each_with_index do |attributes, index|
  Listing.find_or_create_by!(title: attributes[:title]) do |listing|
    listing.assign_attributes(attributes)
    listing.user = users[index % users.size]
    listing.image_url = "https://picsum.photos/seed/vortex-#{index}/600/400"
  end
end

puts "Seeds: #{User.count} usuários e #{Listing.count} anúncios."
