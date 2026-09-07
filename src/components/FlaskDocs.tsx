import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, Heart, Map } from 'lucide-react';

export default function FlaskDocs() {
  return (
    <div className="space-y-12 pb-20">
      <div className="mb-12 text-center">
        <Badge variant="outline" className="mb-4">Backend & Database System</Badge>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Flask API & MySQL Setup</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Comprehensive guide to implementing the backend APIs and database schema for the house recommendation system.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">1. Database Design & SQL Queries</h2>
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm border-b pb-4"><code>database/schema.sql</code></CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto">
{`-- Create Database
CREATE DATABASE IF NOT EXISTS rentmate;
USE rentmate;

-- Create Houses Table
CREATE TABLE IF NOT EXISTS houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    house_type VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    contact VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data Inserts
INSERT INTO houses (district, price, house_type, description, image_url, contact) VALUES 
('Chennai', 18000, 'Apartment', 'Modern 2BHK in Adyar with gym and pool access.', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', '+91-9876543210'),
('Coimbatore', 45000, 'Apartment', 'Luxury 3BHK Penthouse in RS Puram with scenic views.', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', '+91-8765432109'),
('Madurai', 25000, 'Independent House', 'Spacious independent house with a large garden area in Anna Nagar.', 'https://images.unsplash.com/photo-1613977257363-707ba9348227', '+91-7654321098'),
('Chennai', 10000, 'Studio', 'Cozy studio for professionals near OMR IT corridor.', 'https://images.unsplash.com/photo-1536376074432-cd4273af13b2', '+91-9988776655'),
('Salem', 22000, 'Apartment', 'Secure 2BHK in a premium gated community in Alagapuram.', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00', '+91-8877665544');`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">2. Flask API Implementation</h2>
        <p className="text-sm text-slate-600 mb-2">Provides endpoints for getting all houses, searching by district, and filtering by price and house type.</p>
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm border-b pb-4"><code>app.py</code></CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto">
{`from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mysqldb import MySQL
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MySQL Configuration
app.config['MYSQL_HOST'] = os.getenv('DB_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('DB_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.getenv('DB_PASS', 'password')
app.config['MYSQL_DB'] = os.getenv('DB_NAME', 'rentmate')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

@app.route('/api/houses', methods=['GET'])
def get_houses():
    """
    API to get all houses, search by district, and filter by price/house_type.
    Usage Examples:
    - All Houses: GET /api/houses
    - Search by District: GET /api/houses?district=Chennai
    - Filter: GET /api/houses?max_price=20000&house_type=Apartment
    """
    try:
        district = request.args.get('district')
        max_price = request.args.get('max_price')
        house_type = request.args.get('house_type')

        cursor = mysql.connection.cursor()
        
        # Base Query
        query = "SELECT * FROM houses WHERE 1=1"
        params = []

        if district:
            query += " AND LOWER(district) = LOWER(%s)"
            params.append(district)
        
        if max_price:
            query += " AND price <= %s"
            params.append(float(max_price))
        
        if house_type:
            query += " AND LOWER(house_type) = LOWER(%s)"
            params.append(house_type)

        query += " ORDER BY created_at DESC"
        
        cursor.execute(query, tuple(params))
        houses = cursor.fetchall()
        cursor.close()

        return jsonify({
            'status': 'success',
            'count': len(houses),
            'data': houses
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)`}
            </pre>
          </CardContent>
        </Card>
      </div>
      
      <Separator />

      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">3. Recommendation Engine Logic</h2>
        <p className="text-sm text-slate-600 mb-2">Provides a simple recommendation endpoint based on district and budget matching.</p>
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm border-b pb-4"><code>engine/recommend.py & app.py integration</code></CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto">
{`# Add this route to your app.py

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """
    API to get house recommendations "Recommended for you" 
    based on user's selected district and budget.
    Usage Example: GET /api/recommendations?district=Chennai&budget=20000
    """
    try:
        district = request.args.get('district')
        budget = request.args.get('budget', type=float)

        if not district or not budget:
            return jsonify({'status': 'error', 'message': 'District and budget are required.'}), 400

        cursor = mysql.connection.cursor()
        
        # Simple recommendation logic: 
        # Match district and find houses where price is within 20% of the budget.
        # Order by closest price match first to provide best recommendations.
        query = """
            SELECT *, ABS(price - %s) as price_diff 
            FROM houses 
            WHERE LOWER(district) = LOWER(%s)
            AND price <= %s * 1.2  -- allow up to 20% over budget
            ORDER BY price_diff ASC
            LIMIT 5
        """
        
        cursor.execute(query, (budget, district, budget))
        recommended_houses = cursor.fetchall()
        cursor.close()

        return jsonify({
            'status': 'success',
            'count': len(recommended_houses),
            'data': recommended_houses
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500`}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">4. Required Library Setup</h2>
        <Card className="bg-slate-50 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm border-b pb-4">Installation Commands</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-sm text-slate-600">
             <pre className="bg-slate-100 p-2 rounded text-xs border">pip install Flask flask-cors Flask-MySQLdb python-dotenv</pre>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">5. Enhancements (Auth, Favorites, Maps)</h2>
        <p className="text-sm text-slate-600 mb-4">
          The requested enhancements require both frontend and backend integrations to complete the full-stack architecture. Here is the implementation breakdown:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-50 border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4 text-blue-600"/> User Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                We integrate <strong>Firebase Authentication</strong> (Google Provider) on the frontend for secure, seamless logins.
              </p>
              <p className="text-xs text-muted-foreground">
                In the Flask backend, you can pass the Firebase ID token in the <code>Authorization: Bearer</code> header, and verify it using the <code>firebase-admin</code> Python SDK to secure the user-specific APIs.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-50 border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Heart className="w-4 h-4 text-red-500"/> Save Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                Requires a new MySQL table: <code>favorites (user_id, house_id)</code>.
              </p>
              <p className="text-xs text-muted-foreground">
                Create new API routes: <code>POST /api/favorites</code> and <code>GET /api/favorites</code>. The frontend (as demonstrated) maintains a local state synced with the authenticated user's ID. You are prompted to login if you try to favorite while logged out.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-50 border-none shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Map className="w-4 h-4 text-emerald-600"/> Google Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                Integrated directly into the UI via an embedded Google Maps iframe for zero-configuration location viewing.
              </p>
              <p className="text-xs text-muted-foreground">
                By passing <code>{`location, district, Tamil Nadu`}</code> into the Google Maps query URL, we provide instant visual mapping for every listed house without requiring costly API keys.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
