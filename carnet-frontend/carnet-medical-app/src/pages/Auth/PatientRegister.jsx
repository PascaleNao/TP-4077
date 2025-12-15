// src/pages/Auth/PatientRegister.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PatientRegister = () => {
    // ----------------------------------------------------
    // ÉTATS DES DONNÉES DE BASE (EXISTANTS)
    // ----------------------------------------------------
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dateNaissance, setDateNaissance] = useState('');

    // ----------------------------------------------------
    // ÉTATS DES DONNÉES MÉDICALES (NOUVEAUX)
    // ----------------------------------------------------
    const [sexe, setSexe] = useState('');
    const [groupeSanguin, setGroupeSanguin] = useState('');
    const [genotype, setGenotype] = useState('');
    const [allergiesConnues, setAllergiesConnues] = useState('');
    const [maladiesChroniques, setMaladiesChroniques] = useState('');

    // ----------------------------------------------------
    // ÉTATS DE L'INTERFACE
    // ----------------------------------------------------
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const patientData = {
            nom,
            prenom,
            email,
            mot_de_passe: password, // Important : Utiliser le nom de champ du backend
            date_naissance: dateNaissance,
            // 🚨 NOUVELLES DONNÉES INCLUSES POUR LE BACKEND 🚨
            sexe,
            groupe_sanguin: groupeSanguin,
            genotype,
            allergies_connues: allergiesConnues,
            maladies_chroniques: maladiesChroniques,
        };

        const result = await register(patientData);

        setLoading(false);
        if (result.success) {
            // Rediriger vers le tableau de bord ou la page de bienvenue
            navigate('/patient/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '50px auto' }}>
            <div className="card">
                <h1 style={{ color: 'var(--color-primary)' }}>Inscription Patient</h1>
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* SECTION 1 : INFORMATIONS DE BASE */}
                    <h3>Informations d'Identification</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nom">Nom</label>
                            <input type="text" id="nom" className="form-control" value={nom} onChange={(e) => setNom(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prenom">Prénom</label>
                            <input type="text" id="prenom" className="form-control" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input type="password" id="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dateNaissance">Date de Naissance</label>
                            <input type="date" id="dateNaissance" className="form-control" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required />
                        </div>
                    </div>


                    {/* SECTION 2 : INFORMATIONS MÉDICALES INITIALES */}
                    <h3 style={{ marginTop: '30px', borderTop: '1px solid #EEE', paddingTop: '15px' }}>Dossier Initial (Optionnel)</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="sexe">Sexe</label>
                            <select id="sexe" className="form-control" value={sexe} onChange={(e) => setSexe(e.target.value)}>
                                <option value="">Sélectionner</option>
                                <option value="Masculin">Masculin</option>
                                <option value="Féminin">Féminin</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="groupeSanguin">Groupe Sanguin</label>
                            <select id="groupeSanguin" className="form-control" value={groupeSanguin} onChange={(e) => setGroupeSanguin(e.target.value)}>
                                <option value="">Sélectionner</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="genotype">Génotype</label>
                            <select id="genotype" className="form-control" value={genotype} onChange={(e) => setGenotype(e.target.value)}>
                                <option value="">Sélectionner</option>
                                {['AA', 'AS', 'SS', 'AC'].map(geno => (
                                    <option key={geno} value={geno}>{geno}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="allergiesConnues">Allergies Connues (Séparées par des virgules, ex: Pénicilline, Arachides)</label>
                        <textarea
                            id="allergiesConnues"
                            className="form-control"
                            value={allergiesConnues}
                            onChange={(e) => setAllergiesConnues(e.target.value)}
                            rows="2"
                            placeholder="Aucune ou liste détaillée..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="maladiesChroniques">Maladies Chroniques Connues (Séparées par des virgules, ex: Diabète type 2, Hypertension)</label>
                        <textarea
                            id="maladiesChroniques"
                            className="form-control"
                            value={maladiesChroniques}
                            onChange={(e) => setMaladiesChroniques(e.target.value)}
                            rows="2"
                            placeholder="Aucune ou liste détaillée..."
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '20px' }}>
                        {loading ? 'Enregistrement en cours...' : 'Créer mon Dossier et Compte'}
                    </button>
                </form>

                {/* 🚨 NOTE : Vous aurez besoin de la classe CSS .form-row dans votre app.css */}
                <style jsx="true">{`
                    .form-row {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 10px;
                    }
                    .form-row .form-group {
                        flex: 1;
                    }
                    /* ... autres styles si nécessaires ... */
                `}</style>
            </div>
        </div>
    );
};

export default PatientRegister;