// Variáveis globais
let map;
let userMarker;
let unitsMarkers = [];
const ubsUnits = [
    {
        id: 1,
        name: "UBS Centro",
        type: "UBS",
        address: "Av. Paulista, 1000 - São Paulo, SP",
        lat: -23.5609,
        lng: -46.6560,
        phone: "(11) 3234-5678",
        hours: "Seg-Sex: 7h-17h"
    },
    {
        id: 2,
        name: "UBS Vila Mariana",
        type: "UBS",
        address: "Rua Vergueiro, 2000 - São Paulo, SP",
        lat: -23.5873,
        lng: -46.6163,
        phone: "(11) 3234-5679",
        hours: "Seg-Sex: 7h-17h"
    },
    {
        id: 3,
        name: "UPA Centro",
        type: "UPA",
        address: "Av. São Luis, 500 - São Paulo, SP",
        lat: -23.5521,
        lng: -46.6559,
        phone: "(11) 3234-5680",
        hours: "24 horas"
    },
    {
        id: 4,
        name: "UPA Pinheiros",
        type: "UPA",
        address: "Rua Butantã, 300 - São Paulo, SP",
        lat: -23.5635,
        lng: -46.7155,
        phone: "(11) 3234-5681",
        hours: "24 horas"
    },
    {
        id: 5,
        name: "UBS Consolação",
        type: "UBS",
        address: "Av. Consolação, 1500 - São Paulo, SP",
        lat: -23.5495,
        lng: -46.6649,
        phone: "(11) 3234-5682",
        hours: "Seg-Sex: 7h-17h"
    }
];

// Inicialização do mapa
function initMap() {
    const sanPauloCenterLat = -23.5505;
    const sanPauloCenterLng = -46.6333;

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: sanPauloCenterLat, lng: sanPauloCenterLng },
        styles: [
            {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#616161" }]
            }
        ]
    });

    // Carregar unidades no mapa
    loadUnitsOnMap();
}

// Carregar unidades no mapa
function loadUnitsOnMap() {
    clearMarkers();
    const filterUbs = document.getElementById("filter-ubs").checked;
    const filterUpa = document.getElementById("filter-upa").checked;

    ubsUnits.forEach(unit => {
        if ((unit.type === "UBS" && filterUbs) || (unit.type === "UPA" && filterUpa)) {
            const markerColor = unit.type === "UBS" ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" : "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

            const marker = new google.maps.Marker({
                position: { lat: unit.lat, lng: unit.lng },
                map: map,
                title: unit.name,
                icon: markerColor
            });

            marker.addListener("click", () => {
                showUnitDetails(unit);
            });

            unitsMarkers.push(marker);
        }
    });
}

// Limpar marcadores
function clearMarkers() {
    unitsMarkers.forEach(marker => marker.setMap(null));
    unitsMarkers = [];
}

// Obter localização atual
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Remover marcador anterior
                if (userMarker) {
                    userMarker.setMap(null);
                }

                // Adicionar novo marcador
                userMarker = new google.maps.Marker({
                    position: { lat: userLat, lng: userLng },
                    map: map,
                    title: "Sua Localização",
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                });

                // Centralizar mapa
                map.setCenter({ lat: userLat, lng: userLng });
                map.setZoom(15);

                // Calcular distâncias
                calculateDistances(userLat, userLng);
            },
            (error) => {
                alert("Erro ao obter localização: " + error.message);
            }
        );
    } else {
        alert("Geolocalização não é suportada neste navegador.");
    }
}

// Calcular distâncias
function calculateDistances(userLat, userLng) {
    const results = ubsUnits
        .filter(unit => {
            const filterUbs = document.getElementById("filter-ubs").checked;
            const filterUpa = document.getElementById("filter-upa").checked;
            return (unit.type === "UBS" && filterUbs) || (unit.type === "UPA" && filterUpa);
        })
        .map(unit => {
            const distance = calculateDistance(userLat, userLng, unit.lat, unit.lng);
            return { ...unit, distance };
        })
        .sort((a, b) => a.distance - b.distance);

    displayResults(results);
}

// Calcular distância (Fórmula de Haversine)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Exibir resultados
function displayResults(results) {
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";

    if (results.length === 0) {
        resultsList.innerHTML = '<p class="no-results">Nenhuma unidade encontrada com os filtros selecionados.</p>';
        return;
    }

    results.forEach(unit => {
        const resultItem = document.createElement("div");
        resultItem.className = "result-item";
        resultItem.innerHTML = `
            <h4>${unit.name}</h4>
            <p><strong>Tipo:</strong> ${unit.type}</p>
            <p><strong>Endereço:</strong> ${unit.address}</p>
            <p><strong>Telefone:</strong> ${unit.phone}</p>
            <p><strong>Horário:</strong> ${unit.hours}</p>
            <p><strong>Distância:</strong> ${unit.distance.toFixed(2)} km</p>
        `;
        resultsList.appendChild(resultItem);
    });
}

// Mostrar detalhes da unidade (info window)
function showUnitDetails(unit) {
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; color: #333;">
                <h3 style="margin: 0 0 10px 0;">${unit.name}</h3>
                <p><strong>Tipo:</strong> ${unit.type}</p>
                <p><strong>Endereço:</strong> ${unit.address}</p>
                <p><strong>Telefone:</strong> ${unit.phone}</p>
                <p><strong>Horário:</strong> ${unit.hours}</p>
            </div>
        `
    });

    infoWindow.open(map, unitsMarkers[ubsUnits.indexOf(unit)]);
}

// Filtrar localizações
function filterLocations() {
    loadUnitsOnMap();

    if (userMarker) {
        const userLat = userMarker.getPosition().lat();
        const userLng = userMarker.getPosition().lng();
        calculateDistances(userLat, userLng);
    }
}

// Scroll para seção
function scrollTo(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
    }
}

// Processar formulário de contato
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;

    // Validação básica
    if (!name || !email || !message) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    // Enviar para servidor (simulado)
    console.log("Dados do formulário:", { name, email, message });
    alert("Mensagem enviada com sucesso! Entraremos em contato em breve.");

    // Limpar formulário
    form.reset();
}

// Menu hamburger
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    if (hamburger) {
        hamburger.addEventListener("click", function () {
            navMenu.classList.toggle("active");
        });
    }

    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll(".nav-menu a");
    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            navMenu.classList.remove("active");
        });
    });

    // Inicializar mapa
    setTimeout(() => {
        initMap();
    }, 500);
});