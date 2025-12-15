// src/components/medecin/MedecinSearch.jsx
import React, { useState } from 'react';
import { searchPatients } from '../../api/medicalApi';

const MedecinSearch = ({ onSelectPatient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('nom'); // 'nom' ou 'numero_medical'
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResults([]);

        if (!searchTerm.trim()) {
            setError("Veuillez saisir un critère de recherche.");
            return;
        }

        setLoading(true);
        try {
            const query = { [searchType]: searchTerm.trim() };
            const res = await searchPatients(query);
            setResults(res.data.patients);
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la recherche.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flexGrow: 1 }}>
                    <label htmlFor="search-term">Rechercher par {searchType === 'nom' ? 'Nom/Prénom' : 'N° Médical'}</label>
                    <input
                        type="text"
                        id="search-term"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nom, Prénom ou N° Médical"
                        required
                    />
                </div>
                <div className="form-group" style={{ width: '150px' }}>
                    <label htmlFor="search-type">Type</label>
                    <select
                        id="search-type"
                        className="form-control"
                        value={searchType}
                        onChange={(e) => { setSearchType(e.target.value); setSearchTerm(''); }}
                    >
                        <option value="nom">Nom/Prénom</option>
                        <option value="numero_medical">N° Médical</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-end' }}>
                    {loading ? 'Recherche...' : 'Rechercher'}
                </button>
            </form>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Résultats de la Recherche */}
            {results.length > 0 && (
                <div className="card" style={{ marginTop: '15px' }}>
                    <p style={{ fontWeight: 'bold' }}>{results.length} Patient(s) trouvé(s) :</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {results.map((patient) => (
                            <li
                                key={patient.patient_id}
                                onClick={() => onSelectPatient(patient)}
                                style={{
                                    padding: '10px',
                                    borderBottom: '1px solid #EEE',
                                    cursor: 'pointer',
                                    backgroundColor: 'var(--color-background)',
                                    marginBottom: '5px',
                                    borderRadius: '4px'
                                }}
                            >
                                **{patient.nom} {patient.prenom}** (N°: {patient.numero_medical}) - Né(e) le: {new Date(patient.date_naissance).toLocaleDateString()}
                                <span style={{ float: 'right', color: 'var(--color-primary)', fontWeight: 'bold' }}>Consulter &gt;</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {results.length === 0 && searchTerm && !loading && (
                <div className="alert">Recherche... </div>
            )}
        </div>
    );
};

export default MedecinSearch;